import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';

function Loader() {
    const { progress } = useProgress();
    return <Html center className="text-ember font-bold whitespace-nowrap">{progress.toFixed()}% loaded</Html>;
}

function Model({ url }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

const SafeModelViewer = ({ url, width = 400, height = 400 }) => {
    return (
        <div style={{ width, height, touchAction: 'none' }} className="relative pointer-events-auto rounded-full overflow-hidden flex items-center justify-center">
            <Canvas camera={{ position: [5, 2, 5], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <Environment preset="city" />
                <Suspense fallback={<Loader />}>
                    <Model url={url} />
                    <ContactShadows position={[0, -0.6, 0]} opacity={0.6} scale={10} blur={2.5} />
                </Suspense>
                <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
};

export default SafeModelViewer;
