'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TREE_COUNT = 80;
const SPREAD = 30;

interface TreeData {
  position: THREE.Vector3;
  scale: number;
  phase: number;
}

export default function Trees() {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const trees = useMemo<TreeData[]>(() => {
    const arr: TreeData[] = [];
    for (let i = 0; i < TREE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * SPREAD;
      arr.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ),
        scale: 0.6 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  // Set initial transforms once
  useMemo(() => {
    if (!trunkRef.current || !foliageRef.current) return;
    trees.forEach((t, i) => {
      // Trunk
      dummy.position.copy(t.position);
      dummy.position.y = t.scale * 1.5;
      dummy.scale.set(t.scale * 0.3, t.scale * 3, t.scale * 0.3);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);

      // Foliage
      dummy.position.copy(t.position);
      dummy.position.y = t.scale * 4;
      dummy.scale.set(t.scale * 1.6, t.scale * 3, t.scale * 1.6);
      dummy.updateMatrix();
      foliageRef.current!.setMatrixAt(i, dummy.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    foliageRef.current.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trees]);

  useFrame(({ clock }) => {
    if (!trunkRef.current || !foliageRef.current) return;
    const t = clock.getElapsedTime();

    trees.forEach((tree, i) => {
      const sway = Math.sin(t * 0.6 + tree.phase) * 0.02;

      // Foliage sway
      dummy.position.copy(tree.position);
      dummy.position.y = tree.scale * 4;
      dummy.position.x += sway * tree.scale;
      dummy.scale.set(tree.scale * 1.6, tree.scale * 3, tree.scale * 1.6);
      dummy.rotation.set(0, 0, sway);
      dummy.updateMatrix();
      foliageRef.current!.setMatrixAt(i, dummy.matrix);

      // Trunk slight sway
      dummy.position.copy(tree.position);
      dummy.position.y = tree.scale * 1.5;
      dummy.scale.set(tree.scale * 0.3, tree.scale * 3, tree.scale * 0.3);
      dummy.rotation.set(0, 0, sway * 0.3);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    foliageRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Trunks */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, TREE_COUNT]}>
        <cylinderGeometry args={[0.5, 0.7, 1, 8]} />
        <meshStandardMaterial color="#5C3D2E" roughness={0.9} />
      </instancedMesh>

      {/* Foliage */}
      <instancedMesh ref={foliageRef} args={[undefined, undefined, TREE_COUNT]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#2D5A27" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
