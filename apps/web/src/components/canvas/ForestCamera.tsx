'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ForestCameraProps {
  /** Scroll progress 0 → 1 */
  scrollProgress?: number;
}

export default function ForestCamera({ scrollProgress = 0 }: ForestCameraProps) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 30, 10));

  useFrame(() => {
    // Interpolate Y from 30 (top) down to 2 (ground level)
    const startY = 30;
    const endY = 2;
    const startZ = 10;
    const endZ = 6;

    const desiredY = THREE.MathUtils.lerp(startY, endY, scrollProgress);
    const desiredZ = THREE.MathUtils.lerp(startZ, endZ, scrollProgress);

    target.current.set(0, desiredY, desiredZ);

    // Smooth follow
    camera.position.lerp(target.current, 0.05);
    camera.lookAt(0, desiredY * 0.3, 0);
  });

  return null;
}
