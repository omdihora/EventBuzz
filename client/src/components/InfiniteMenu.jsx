import { useEffect, useRef, useState } from 'react';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';

/* ═══════════════════════════════════════════════════════════════════
   WebGL Shaders
   ═══════════════════════════════════════════════════════════════════ */

const discVertShaderSource = `#version 300 es

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

#define PI 3.141593

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);

    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);

    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }

    worldPosition.xyz = radius * normalize(worldPosition.xyz);

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

out vec4 outColor;

in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    ivec2 texSize = textureSize(uTex, 0);
    float imageAspect = float(texSize.x) / float(texSize.y);
    float containerAspect = 1.0;
    
    float scale = max(imageAspect / containerAspect, 
                     containerAspect / imageAspect);
    
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = (st - 0.5) * scale + 0.5;
    st = clamp(st, 0.0, 1.0);
    st = st * cellSize + cellOffset;
    
    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}
`;

/* ═══════════════════════════════════════════════════════════════════
   Geometry classes
   ═══════════════════════════════════════════════════════════════════ */

class Face {
    constructor(a, b, c) { this.a = a; this.b = b; this.c = c; }
}

class Vertex {
    constructor(x, y, z) {
        this.position = vec3.fromValues(x, y, z);
        this.normal = vec3.create();
        this.uv = vec2.create();
    }
}

class Geometry {
    constructor() { this.vertices = []; this.faces = []; }
    addVertex(...args) { for (let i = 0; i < args.length; i += 3) this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2])); return this; }
    addFace(...args) { for (let i = 0; i < args.length; i += 3) this.faces.push(new Face(args[i], args[i + 1], args[i + 2])); return this; }
    get lastVertex() { return this.vertices[this.vertices.length - 1]; }

    subdivide(divisions = 1) {
        const cache = {};
        let f = this.faces;
        for (let d = 0; d < divisions; ++d) {
            const nf = new Array(f.length * 4);
            f.forEach((face, ndx) => {
                const mAB = this.getMidPoint(face.a, face.b, cache);
                const mBC = this.getMidPoint(face.b, face.c, cache);
                const mCA = this.getMidPoint(face.c, face.a, cache);
                const i = ndx * 4;
                nf[i] = new Face(face.a, mAB, mCA);
                nf[i + 1] = new Face(face.b, mBC, mAB);
                nf[i + 2] = new Face(face.c, mCA, mBC);
                nf[i + 3] = new Face(mAB, mBC, mCA);
            });
            f = nf;
        }
        this.faces = f;
        return this;
    }

    spherize(radius = 1) {
        this.vertices.forEach(v => { vec3.normalize(v.normal, v.position); vec3.scale(v.position, v.normal, radius); });
        return this;
    }

    get vertexData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.position))); }
    get normalData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.normal))); }
    get uvData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.uv))); }
    get indexData() { return new Uint16Array(this.faces.flatMap(f => [f.a, f.b, f.c])); }
    get data() { return { vertices: this.vertexData, indices: this.indexData, normals: this.normalData, uvs: this.uvData }; }

    getMidPoint(ndxA, ndxB, cache) {
        const key = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`;
        if (Object.prototype.hasOwnProperty.call(cache, key)) return cache[key];
        const a = this.vertices[ndxA].position, b = this.vertices[ndxB].position;
        const ndx = this.vertices.length;
        cache[key] = ndx;
        this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
        return ndx;
    }
}

class IcosahedronGeometry extends Geometry {
    constructor() {
        super();
        const t = Math.sqrt(5) * 0.5 + 0.5;
        this.addVertex(-1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0, 0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1)
            .addFace(0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1);
    }
}

class DiscGeometry extends Geometry {
    constructor(steps = 4, radius = 1) {
        super();
        steps = Math.max(4, steps);
        const alpha = (2 * Math.PI) / steps;
        this.addVertex(0, 0, 0);
        this.lastVertex.uv[0] = 0.5; this.lastVertex.uv[1] = 0.5;
        for (let i = 0; i < steps; ++i) {
            const x = Math.cos(alpha * i), y = Math.sin(alpha * i);
            this.addVertex(radius * x, radius * y, 0);
            this.lastVertex.uv[0] = x * 0.5 + 0.5; this.lastVertex.uv[1] = y * 0.5 + 0.5;
            if (i > 0) this.addFace(0, i, i + 1);
        }
        this.addFace(0, steps, 1);
    }
}

/* ═══════════════════════════════════════════════════════════════════
   WebGL helpers
   ═══════════════════════════════════════════════════════════════════ */

function createShader(gl, type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source); gl.compileShader(s);
    if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s;
    console.error(gl.getShaderInfoLog(s)); gl.deleteShader(s); return null;
}

function createProgram(gl, sources, tfv, attribLocs) {
    const p = gl.createProgram();
    [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((t, i) => { const s = createShader(gl, t, sources[i]); if (s) gl.attachShader(p, s); });
    if (tfv) gl.transformFeedbackVaryings(p, tfv, gl.SEPARATE_ATTRIBS);
    if (attribLocs) for (const a in attribLocs) gl.bindAttribLocation(p, attribLocs[a], a);
    gl.linkProgram(p);
    if (gl.getProgramParameter(p, gl.LINK_STATUS)) return p;
    console.error(gl.getProgramInfoLog(p)); gl.deleteProgram(p); return null;
}

function makeBuffer(gl, data, usage) {
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage); gl.bindBuffer(gl.ARRAY_BUFFER, null); return b;
}

function makeVertexArray(gl, bufLocPairs, indices) {
    const va = gl.createVertexArray(); gl.bindVertexArray(va);
    for (const [buf, loc, n] of bufLocPairs) { if (loc === -1) continue; gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0); }
    if (indices) { const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW); }
    gl.bindVertexArray(null); return va;
}

function resizeCanvasToDisplaySize(canvas) {
    const dpr = Math.min(2, window.devicePixelRatio);
    const dw = Math.round(canvas.clientWidth * dpr), dh = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== dw || canvas.height !== dh) { canvas.width = dw; canvas.height = dh; return true; }
    return false;
}

function createAndSetupTexture(gl, minF, magF, wrapS, wrapT) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minF); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magF);
    return t;
}

/* ═══════════════════════════════════════════════════════════════════
   Arcball control
   ═══════════════════════════════════════════════════════════════════ */

class ArcballControl {
    isPointerDown = false;
    orientation = quat.create();
    pointerRotation = quat.create();
    rotationVelocity = 0;
    rotationAxis = vec3.fromValues(1, 0, 0);
    snapDirection = vec3.fromValues(0, 0, -1);
    snapTargetDirection;
    EPSILON = 0.1;
    IDENTITY_QUAT = quat.create();

    constructor(canvas, cb) {
        this.canvas = canvas; this.updateCallback = cb || (() => null);
        this.pointerPos = vec2.create(); this.previousPointerPos = vec2.create();
        this._rotationVelocity = 0; this._combinedQuat = quat.create();

        canvas.addEventListener('pointerdown', e => { vec2.set(this.pointerPos, e.clientX, e.clientY); vec2.copy(this.previousPointerPos, this.pointerPos); this.isPointerDown = true; });
        canvas.addEventListener('pointerup', () => { this.isPointerDown = false; });
        canvas.addEventListener('pointerleave', () => { this.isPointerDown = false; });
        canvas.addEventListener('pointermove', e => { if (this.isPointerDown) vec2.set(this.pointerPos, e.clientX, e.clientY); });
        canvas.style.touchAction = 'none';
    }

    update(dt, targetFD = 16) {
        const ts = dt / targetFD + 0.00001;
        let af = ts;
        let snapRot = quat.create();

        if (this.isPointerDown) {
            const I = 0.3 * ts, AA = 5 / ts;
            const mid = vec2.sub(vec2.create(), this.pointerPos, this.previousPointerPos);
            vec2.scale(mid, mid, I);
            if (vec2.sqrLen(mid) > this.EPSILON) {
                vec2.add(mid, this.previousPointerPos, mid);
                const p = this.#project(mid), q = this.#project(this.previousPointerPos);
                const a = vec3.normalize(vec3.create(), p), b = vec3.normalize(vec3.create(), q);
                vec2.copy(this.previousPointerPos, mid);
                af *= AA;
                this.quatFromVectors(a, b, this.pointerRotation, af);
            } else { quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, I); }
        } else {
            quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, 0.1 * ts);
            if (this.snapTargetDirection) {
                const a = this.snapTargetDirection, b = this.snapDirection;
                const df = Math.max(0.1, 1 - vec3.squaredDistance(a, b) * 10);
                af *= 0.2 * df;
                this.quatFromVectors(a, b, snapRot, af);
            }
        }

        const cq = quat.multiply(quat.create(), snapRot, this.pointerRotation);
        this.orientation = quat.multiply(quat.create(), cq, this.orientation);
        quat.normalize(this.orientation, this.orientation);

        quat.slerp(this._combinedQuat, this._combinedQuat, cq, 0.8 * ts);
        quat.normalize(this._combinedQuat, this._combinedQuat);

        const rad = Math.acos(this._combinedQuat[3]) * 2.0;
        const s = Math.sin(rad / 2.0);
        let rv = 0;
        if (s > 0.000001) {
            rv = rad / (2 * Math.PI);
            this.rotationAxis[0] = this._combinedQuat[0] / s;
            this.rotationAxis[1] = this._combinedQuat[1] / s;
            this.rotationAxis[2] = this._combinedQuat[2] / s;
        }
        this._rotationVelocity += (rv - this._rotationVelocity) * (0.5 * ts);
        this.rotationVelocity = this._rotationVelocity / ts;
        this.updateCallback(dt);
    }

    quatFromVectors(a, b, out, af = 1) {
        const axis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), a, b));
        const d = Math.max(-1, Math.min(1, vec3.dot(a, b)));
        quat.setAxisAngle(out, axis, Math.acos(d) * af);
        return out;
    }

    #project(pos) {
        const r = 2, w = this.canvas.clientWidth, h = this.canvas.clientHeight, s = Math.max(w, h) - 1;
        const x = (2 * pos[0] - w - 1) / s, y = (2 * pos[1] - h - 1) / s;
        const xySq = x * x + y * y, rSq = r * r;
        const z = xySq <= rSq / 2.0 ? Math.sqrt(rSq - xySq) : rSq / Math.sqrt(xySq);
        return vec3.fromValues(-x, y, z);
    }
}

/* ═══════════════════════════════════════════════════════════════════
   InfiniteGridMenu engine
   ═══════════════════════════════════════════════════════════════════ */

class InfiniteGridMenu {
    TARGET_FRAME_DURATION = 1000 / 60;
    SPHERE_RADIUS = 2;
    #time = 0; #deltaTime = 0; #deltaFrames = 0; #frames = 0;

    camera = {
        matrix: mat4.create(), near: 0.1, far: 40, fov: Math.PI / 4, aspect: 1,
        position: vec3.fromValues(0, 0, 3), up: vec3.fromValues(0, 1, 0),
        matrices: { view: mat4.create(), projection: mat4.create(), inversProjection: mat4.create() }
    };

    smoothRotationVelocity = 0;
    scaleFactor = 1.0;
    movementActive = false;
    destroyed = false;

    constructor(canvas, items, onActiveItemChange, onMovementChange, onInit, scale = 1.0) {
        this.canvas = canvas;
        this.items = items || [];
        this.onActiveItemChange = onActiveItemChange || (() => { });
        this.onMovementChange = onMovementChange || (() => { });
        this.scaleFactor = scale;
        this.camera.position[2] = 3 * scale;
        this.#init(onInit);
    }

    destroy() { this.destroyed = true; }

    resize() {
        this.viewportSize = vec2.set(this.viewportSize || vec2.create(), this.canvas.clientWidth, this.canvas.clientHeight);
        const gl = this.gl;
        if (resizeCanvasToDisplaySize(gl.canvas)) gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        this.#updateProjectionMatrix(gl);
    }

    run(time = 0) {
        if (this.destroyed) return;
        this.#deltaTime = Math.min(32, time - this.#time);
        this.#time = time;
        this.#deltaFrames = this.#deltaTime / this.TARGET_FRAME_DURATION;
        this.#frames += this.#deltaFrames;
        this.#animate(this.#deltaTime);
        this.#render();
        requestAnimationFrame(t => this.run(t));
    }

    #init(onInit) {
        this.gl = this.canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: false });
        const gl = this.gl;
        if (!gl) throw new Error('No WebGL 2 context!');

        this.viewportSize = vec2.fromValues(this.canvas.clientWidth, this.canvas.clientHeight);
        this.discProgram = createProgram(gl, [discVertShaderSource, discFragShaderSource], null, {
            aModelPosition: 0, aModelNormal: 1, aModelUvs: 2, aInstanceMatrix: 3
        });

        this.discLocations = {
            aModelPosition: gl.getAttribLocation(this.discProgram, 'aModelPosition'),
            aModelUvs: gl.getAttribLocation(this.discProgram, 'aModelUvs'),
            aInstanceMatrix: gl.getAttribLocation(this.discProgram, 'aInstanceMatrix'),
            uWorldMatrix: gl.getUniformLocation(this.discProgram, 'uWorldMatrix'),
            uViewMatrix: gl.getUniformLocation(this.discProgram, 'uViewMatrix'),
            uProjectionMatrix: gl.getUniformLocation(this.discProgram, 'uProjectionMatrix'),
            uCameraPosition: gl.getUniformLocation(this.discProgram, 'uCameraPosition'),
            uScaleFactor: gl.getUniformLocation(this.discProgram, 'uScaleFactor'),
            uRotationAxisVelocity: gl.getUniformLocation(this.discProgram, 'uRotationAxisVelocity'),
            uTex: gl.getUniformLocation(this.discProgram, 'uTex'),
            uFrames: gl.getUniformLocation(this.discProgram, 'uFrames'),
            uItemCount: gl.getUniformLocation(this.discProgram, 'uItemCount'),
            uAtlasSize: gl.getUniformLocation(this.discProgram, 'uAtlasSize'),
        };

        this.discGeo = new DiscGeometry(56, 1);
        this.discBuffers = this.discGeo.data;
        this.discVAO = makeVertexArray(gl, [
            [makeBuffer(gl, this.discBuffers.vertices, gl.STATIC_DRAW), this.discLocations.aModelPosition, 3],
            [makeBuffer(gl, this.discBuffers.uvs, gl.STATIC_DRAW), this.discLocations.aModelUvs, 2]
        ], this.discBuffers.indices);

        this.icoGeo = new IcosahedronGeometry();
        this.icoGeo.subdivide(1).spherize(this.SPHERE_RADIUS);
        this.instancePositions = this.icoGeo.vertices.map(v => v.position);
        this.DISC_INSTANCE_COUNT = this.icoGeo.vertices.length;
        this.#initDiscInstances(this.DISC_INSTANCE_COUNT);

        this.worldMatrix = mat4.create();
        this.#initTexture();
        this.control = new ArcballControl(this.canvas, dt => this.#onControlUpdate(dt));
        this.#updateCameraMatrix();
        this.#updateProjectionMatrix(gl);
        this.resize();
        if (onInit) onInit(this);
    }

    #initTexture() {
        const gl = this.gl;
        this.tex = createAndSetupTexture(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
        const itemCount = Math.max(1, this.items.length);
        this.atlasSize = Math.ceil(Math.sqrt(itemCount));
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const cellSize = 512;
        canvas.width = this.atlasSize * cellSize;
        canvas.height = this.atlasSize * cellSize;

        // Fill with placeholder gradient while images load
        this.items.forEach((item, i) => {
            const x = (i % this.atlasSize) * cellSize;
            const y = Math.floor(i / this.atlasSize) * cellSize;
            const grad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
            grad.addColorStop(0, item.gradientStart || '#4f46e5');
            grad.addColorStop(1, item.gradientEnd || '#7c3aed');
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, cellSize, cellSize);
            // Draw icon text
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = `${cellSize * 0.4}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.icon || '🏛️', x + cellSize / 2, y + cellSize / 2);
        });
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);

        // Load real images over gradients
        Promise.all(this.items.map(item => new Promise(resolve => {
            const img = new Image(); img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = item.image;
        }))).then(images => {
            if (this.destroyed) return;
            images.forEach((img, i) => {
                if (!img) return;
                const x = (i % this.atlasSize) * cellSize;
                const y = Math.floor(i / this.atlasSize) * cellSize;
                ctx.drawImage(img, x, y, cellSize, cellSize);
            });
            gl.bindTexture(gl.TEXTURE_2D, this.tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
            gl.generateMipmap(gl.TEXTURE_2D);
        });
    }

    #initDiscInstances(count) {
        const gl = this.gl;
        this.discInstances = { matricesArray: new Float32Array(count * 16), matrices: [], buffer: gl.createBuffer() };
        for (let i = 0; i < count; ++i) {
            const arr = new Float32Array(this.discInstances.matricesArray.buffer, i * 16 * 4, 16);
            arr.set(mat4.create());
            this.discInstances.matrices.push(arr);
        }
        gl.bindVertexArray(this.discVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.discInstances.matricesArray.byteLength, gl.DYNAMIC_DRAW);
        for (let j = 0; j < 4; ++j) {
            const loc = this.discLocations.aInstanceMatrix + j;
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, j * 16);
            gl.vertexAttribDivisor(loc, 1);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    #animate(dt) {
        const gl = this.gl;
        this.control.update(dt, this.TARGET_FRAME_DURATION);
        const scale = 0.25;
        const SI = 0.6;
        this.instancePositions.forEach((p, ndx) => {
            const tp = vec3.transformQuat(vec3.create(), p, this.control.orientation);
            const s = (Math.abs(tp[2]) / this.SPHERE_RADIUS) * SI + (1 - SI);
            const fs = s * scale;
            const m = mat4.create();
            mat4.multiply(m, m, mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), tp)));
            mat4.multiply(m, m, mat4.targetTo(mat4.create(), [0, 0, 0], tp, [0, 1, 0]));
            mat4.multiply(m, m, mat4.fromScaling(mat4.create(), [fs, fs, fs]));
            mat4.multiply(m, m, mat4.fromTranslation(mat4.create(), [0, 0, -this.SPHERE_RADIUS]));
            mat4.copy(this.discInstances.matrices[ndx], m);
        });
        gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.discInstances.matricesArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.smoothRotationVelocity = this.control.rotationVelocity;
    }

    #render() {
        const gl = this.gl;
        gl.useProgram(this.discProgram);
        gl.enable(gl.CULL_FACE); gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(this.discLocations.uWorldMatrix, false, this.worldMatrix);
        gl.uniformMatrix4fv(this.discLocations.uViewMatrix, false, this.camera.matrices.view);
        gl.uniformMatrix4fv(this.discLocations.uProjectionMatrix, false, this.camera.matrices.projection);
        gl.uniform3f(this.discLocations.uCameraPosition, ...this.camera.position);
        gl.uniform4f(this.discLocations.uRotationAxisVelocity, ...this.control.rotationAxis, this.smoothRotationVelocity * 1.1);
        gl.uniform1i(this.discLocations.uItemCount, this.items.length);
        gl.uniform1i(this.discLocations.uAtlasSize, this.atlasSize);
        gl.uniform1f(this.discLocations.uFrames, this.#frames);
        gl.uniform1f(this.discLocations.uScaleFactor, this.scaleFactor);
        gl.uniform1i(this.discLocations.uTex, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.bindVertexArray(this.discVAO);
        gl.drawElementsInstanced(gl.TRIANGLES, this.discBuffers.indices.length, gl.UNSIGNED_SHORT, 0, this.DISC_INSTANCE_COUNT);
    }

    #updateCameraMatrix() {
        mat4.targetTo(this.camera.matrix, this.camera.position, [0, 0, 0], this.camera.up);
        mat4.invert(this.camera.matrices.view, this.camera.matrix);
    }

    #updateProjectionMatrix(gl) {
        this.camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const h = this.SPHERE_RADIUS * 0.35, d = this.camera.position[2];
        this.camera.fov = this.camera.aspect > 1 ? 2 * Math.atan(h / d) : 2 * Math.atan(h / this.camera.aspect / d);
        mat4.perspective(this.camera.matrices.projection, this.camera.fov, this.camera.aspect, this.camera.near, this.camera.far);
        mat4.invert(this.camera.matrices.inversProjection, this.camera.matrices.projection);
    }

    #onControlUpdate(dt) {
        const ts = dt / this.TARGET_FRAME_DURATION + 0.0001;
        let damping = 5 / ts, camZ = 3 * this.scaleFactor;
        const isMoving = this.control.isPointerDown || Math.abs(this.smoothRotationVelocity) > 0.01;
        if (isMoving !== this.movementActive) { this.movementActive = isMoving; this.onMovementChange(isMoving); }

        if (!this.control.isPointerDown) {
            const ni = this.#findNearestVertexIndex();
            this.onActiveItemChange(ni % Math.max(1, this.items.length));
            this.control.snapTargetDirection = vec3.normalize(vec3.create(), this.#getVertexWorldPosition(ni));
        } else { camZ += this.control.rotationVelocity * 80 + 2.5; damping = 7 / ts; }

        this.camera.position[2] += (camZ - this.camera.position[2]) / damping;
        this.#updateCameraMatrix();
    }

    #findNearestVertexIndex() {
        const nt = vec3.transformQuat(vec3.create(), this.control.snapDirection, quat.conjugate(quat.create(), this.control.orientation));
        let maxD = -1, ni = 0;
        for (let i = 0; i < this.instancePositions.length; ++i) {
            const d = vec3.dot(nt, this.instancePositions[i]);
            if (d > maxD) { maxD = d; ni = i; }
        }
        return ni;
    }

    #getVertexWorldPosition(i) { return vec3.transformQuat(vec3.create(), this.instancePositions[i], this.control.orientation); }
}

/* ═══════════════════════════════════════════════════════════════════
   React Component
   ═══════════════════════════════════════════════════════════════════ */

export default function InfiniteMenu({ items = [], scale = 1.0, onSelect }) {
    const canvasRef = useRef(null);
    const sketchRef = useRef(null);
    const [activeItem, setActiveItem] = useState(null);
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !items.length) return;

        const handleActiveItem = index => {
            const itemIndex = index % items.length;
            setActiveItem(items[itemIndex]);
        };

        const sketch = new InfiniteGridMenu(
            canvas, items, handleActiveItem, setIsMoving,
            sk => sk.run(), scale
        );
        sketchRef.current = sketch;

        const handleResize = () => sketch.resize();
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            sketch.destroy();
            window.removeEventListener('resize', handleResize);
        };
    }, [items, scale]);

    const handleClick = () => {
        if (!activeItem || isMoving) return;
        if (onSelect) onSelect(activeItem);
    };

    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                className="cursor-grab w-full h-full overflow-hidden relative outline-none active:cursor-grabbing"
                style={{ background: 'transparent' }}
            />
            {activeItem && (
                <>
                    <h2 className={`select-none absolute font-extrabold text-3xl sm:text-5xl left-6 sm:left-12 top-1/2 -translate-y-1/2 transition-all ease-out text-slate-800 max-w-[5ch] leading-tight ${isMoving ? 'opacity-0 pointer-events-none duration-100 translate-x-4' : 'opacity-100 pointer-events-auto duration-500 translate-x-0'}`}>
                        {activeItem.title}
                    </h2>
                    <p className={`select-none absolute max-w-[12ch] text-sm sm:text-lg text-slate-500 top-1/2 right-6 sm:right-12 -translate-y-1/2 transition-all ease-out ${isMoving ? 'opacity-0 pointer-events-none duration-100 translate-x-[-4px]' : 'opacity-100 pointer-events-auto duration-500 translate-x-0'}`}>
                        {activeItem.description}
                    </p>
                    <div
                        onClick={handleClick}
                        className={`absolute left-1/2 -translate-x-1/2 z-10 transition-all ease-out ${isMoving ? 'bottom-[-80px] opacity-0 pointer-events-none duration-100 scale-0' : 'bottom-6 opacity-100 pointer-events-auto duration-500 scale-100'}`}
                    >
                        <button className="btn-primary !rounded-full !py-3.5 !px-8 shadow-xl shadow-indigo-300/30 text-sm font-bold">
                            View Club →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
