'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

import fogFrag from '@/shaders/fog.frag';

const fogVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FogPlaneMaterial = shaderMaterial(
  {
    uTime: 0,
    uDensity: 0.4,
    uColor: new THREE.Color(0.85, 0.88, 0.82),
  },
  fogVert,
  fogFrag,
);

extend({ FogPlaneMaterial });



const PLANE_COUNT = 4;

interface FogPlane {
  z: number;
  y: number;
  density: number;
  speed: number;
}

export default function Fog() {
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);

  const planes = useMemo<FogPlane[]>(
    () =>
      Array.from({ length: PLANE_COUNT }, (_, i) => ({
        z: -5 - i * 6,
        y: 1 + i * 0.5,
        density: 0.25 + i * 0.08,
        speed: 0.8 + i * 0.3,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    matRefs.current.forEach((mat, i) => {
      if (mat) {
        (mat.uniforms as Record<string, THREE.IUniform>).uTime.value =
          t * planes[i].speed;
      }
    });
  });

  return (
    <group>
      {planes.map((p, i) => (
        <mesh key={i} position={[0, p.y, p.z]} rotation={[0, 0, 0]}>
          <planeGeometry args={[60, 10]} />
          <fogPlaneMaterial
            ref={(el: THREE.ShaderMaterial | null) => {
              matRefs.current[i] = el;
            }}
            transparent
            depthWrite={false}
            uDensity={p.density}
            uColor={new THREE.Color(0.85, 0.88, 0.82)}
          />
        </mesh>
      ))}
    </group>
  );
}
