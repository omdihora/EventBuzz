import { useEffect, useRef } from 'react';

/*  ═══════════════════════════════════════════════════════════
    EmberCanvas — A lightweight animated particle constellation
    with floating embers (coral) and frost particles (teal),
    connected by delicate lines when nearby.
    ═══════════════════════════════════════════════════════════ */

export default function EmberCanvas({ className, style }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf;
        let w, h;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.parentElement.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        // Ember & Frost color palette
        const colors = [
            { r: 232, g: 114, b: 92, a: 0.6 },   // ember coral
            { r: 240, g: 160, b: 67, a: 0.5 },    // amber gold
            { r: 46, g: 196, b: 182, a: 0.45 },  // frost teal
            { r: 232, g: 114, b: 92, a: 0.35 },   // ember light
            { r: 212, g: 96, b: 79, a: 0.4 },    // ember dark
        ];

        const PARTICLE_COUNT = 65;
        const CONNECTION_DISTANCE = 140;
        const particles = [];

        // Mouse tracking
        const mouse = { x: -999, y: -999 };
        const onMouseMove = e => {
            const rect = canvas.parentElement.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        const onMouseLeave = () => { mouse.x = -999; mouse.y = -999; };
        canvas.parentElement.addEventListener('mousemove', onMouseMove);
        canvas.parentElement.addEventListener('mouseleave', onMouseLeave);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.4 - 0.15; // slight upward drift (ember)
                this.radius = Math.random() * 2.5 + 1;
                this.baseRadius = this.radius;
                const c = colors[Math.floor(Math.random() * colors.length)];
                this.color = c;
                this.pulse = Math.random() * Math.PI * 2;
                this.pulseSpeed = 0.01 + Math.random() * 0.02;
            }
            update() {
                this.pulse += this.pulseSpeed;
                this.radius = this.baseRadius + Math.sin(this.pulse) * 0.8;

                // Mouse attraction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 180 && dist > 1) {
                    const force = (180 - dist) / 180 * 0.012;
                    this.vx += dx / dist * force;
                    this.vy += dy / dist * force;
                }

                // Damping
                this.vx *= 0.995;
                this.vy *= 0.995;

                this.x += this.vx;
                this.y += this.vy;

                // Wrap around
                if (this.x < -20) this.x = w + 20;
                if (this.x > w + 20) this.x = -20;
                if (this.y < -20) this.y = h + 20;
                if (this.y > h + 20) this.y = -20;
            }
            draw() {
                const alpha = this.color.a + Math.sin(this.pulse) * 0.15;
                // Glow
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4);
                grad.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha * 0.4})`);
                grad.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        // Floating geometric shapes
        const shapes = [];
        const SHAPE_COUNT = 8;
        for (let i = 0; i < SHAPE_COUNT; i++) {
            shapes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 15 + Math.random() * 30,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.008,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.2,
                type: Math.floor(Math.random() * 3), // 0=hexagon, 1=triangle, 2=diamond
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 0.06 + Math.random() * 0.08,
            });
        }

        function drawShape(s) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.strokeStyle = `rgba(${s.color.r},${s.color.g},${s.color.b},${s.opacity})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            const n = s.type === 0 ? 6 : s.type === 1 ? 3 : 4;
            for (let i = 0; i <= n; i++) {
                const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * s.size;
                const y = Math.sin(angle) * s.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        const tick = () => {
            ctx.clearRect(0, 0, w, h);

            // Update & draw shapes
            for (const s of shapes) {
                s.rotation += s.rotSpeed;
                s.x += s.vx;
                s.y += s.vy;
                if (s.x < -50) s.x = w + 50;
                if (s.x > w + 50) s.x = -50;
                if (s.y < -50) s.y = h + 50;
                if (s.y > h + 50) s.y = -50;
                drawShape(s);
            }

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DISTANCE) {
                        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.12;
                        const ci = particles[i].color;
                        const cj = particles[j].color;
                        const r = Math.round((ci.r + cj.r) / 2);
                        const g = Math.round((ci.g + cj.g) / 2);
                        const b = Math.round((ci.b + cj.b) / 2);
                        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Mouse attraction lines
            if (mouse.x > 0 && mouse.y > 0) {
                for (const p of particles) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 180) {
                        const alpha = (1 - dist / 180) * 0.15;
                        ctx.strokeStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }

            // Update & draw particles
            for (const p of particles) {
                p.update();
                p.draw();
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            canvas.parentElement?.removeEventListener('mousemove', onMouseMove);
            canvas.parentElement?.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className ?? ''}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}
        />
    );
}
