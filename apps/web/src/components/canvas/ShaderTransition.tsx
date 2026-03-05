'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import dissolveFrag from '@/shaders/dissolve.frag';

const transitionVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

interface ShaderTransitionProps {
  /** Dissolve progress 0 → 1 */
  progress?: number;
  /** Optional source texture */
  texture?: THREE.Texture | null;
}

export default function ShaderTransition({
  progress = 0,
  texture,
}: ShaderTransitionProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const noiseTexture = useMemo(() => {
    const w = 256;
    const h = 256;
    const data = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const v = Math.random() * 255;
      data[i * 4] = v;
      data[i * 4 + 1] = v;
      data[i * 4 + 2] = v;
      data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const fallbackTexture = useMemo(() => {
    const data = new Uint8Array([0, 0, 0, 255]);
    const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTexture: { value: fallbackTexture },
      uNoise: { value: noiseTexture },
    }),
    [noiseTexture, fallbackTexture],
  );

  useFrame(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uProgress.value = progress;
    if (texture) {
      matRef.current.uniforms.uTexture.value = texture;
    }
  });

  // Nothing to render when fully un-dissolved; avoids an unnecessary draw call
  if (progress <= 0) return null;

  return (
    <mesh frustumCulled={false} renderOrder={999}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={transitionVert}
        fragmentShader={dissolveFrag}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
