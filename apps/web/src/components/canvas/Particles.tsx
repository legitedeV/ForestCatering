'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 200;
const BOUNDS_Y_TOP = 25;
const BOUNDS_Y_BOTTOM = -2;
const SPREAD = 30;

export default function Particles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * SPREAD;
      pos[i3 + 1] = Math.random() * BOUNDS_Y_TOP;
      pos[i3 + 2] = (Math.random() - 0.5) * SPREAD;

      // Slow drift down with slight horizontal wobble
      vel[i3] = (Math.random() - 0.5) * 0.002;
      vel[i3 + 1] = -(0.005 + Math.random() * 0.01);
      vel[i3 + 2] = (Math.random() - 0.5) * 0.002;
    }

    return { positions: pos, velocities: vel };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Horizontal wobble
      arr[i3] += velocities[i3] + Math.sin(t * 0.5 + i) * 0.002;
      arr[i3 + 1] += velocities[i3 + 1];
      arr[i3 + 2] += velocities[i3 + 2] + Math.cos(t * 0.4 + i) * 0.002;

      // Recycle particles that fall below threshold
      if (arr[i3 + 1] < BOUNDS_Y_BOTTOM) {
        arr[i3] = (Math.random() - 0.5) * SPREAD;
        arr[i3 + 1] = BOUNDS_Y_TOP;
        arr[i3 + 2] = (Math.random() - 0.5) * SPREAD;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#C8A862"
        transparent
        opacity={0.8}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
