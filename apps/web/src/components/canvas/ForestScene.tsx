'use client';

import { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';

import ForestCamera from './ForestCamera';
import Trees from './Trees';
import Fog from './Fog';
import Particles from './Particles';
import Preloader from './Preloader';

function SceneContent({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <ForestCamera scrollProgress={scrollProgress} />

      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 20, 5]} intensity={1.2} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#C8A862" />

      {/* Scene objects */}
      <Trees />
      <Fog />
      <Particles />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1B3A1A" roughness={1} />
      </mesh>
    </>
  );
}

export interface ForestSceneProps {
  scrollProgress?: number;
  className?: string;
}

export function ForestSceneInner({
  scrollProgress = 0,
  className,
}: ForestSceneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const handleCreated = useCallback(() => {
    setLoadProgress(100);
    // Let the progress bar fill before hiding
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <Preloader isLoading={isLoading} progress={loadProgress} />

      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        camera={{ position: [0, 30, 10], fov: 55, near: 0.1, far: 200 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        onCreated={() => handleCreated()}
      >
        <color attach="background" args={['#0A0A0A']} />
        <fog attach="fog" args={['#0A0A0A', 20, 60]} />
        <Suspense fallback={null}>
          <SceneContent scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}

const ForestScene = dynamic(
  () => Promise.resolve({ default: ForestSceneInner }),
  { ssr: false },
);

export default ForestScene;
