import type { ThreeElements } from '@react-three/fiber';
import type { Color } from 'three';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      fogPlaneMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        uTime?: number;
        uDensity?: number;
        uColor?: Color;
      };
    }
  }
}
