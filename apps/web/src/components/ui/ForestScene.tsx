'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'

/* ─────────────────────────────────────────────
   ForestScene — Three.js WebGL background
   Fireflies · Floating leaves · Volumetric fog · Light rays
   ───────────────────────────────────────────── */

const FIREFLY_COUNT = 80
const LEAF_COUNT = 30
const FOG_COLOR = 0x1f242b

function createFireflies(scene: THREE.Scene) {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(FIREFLY_COUNT * 3)
  const sizes = new Float32Array(FIREFLY_COUNT)
  const phases = new Float32Array(FIREFLY_COUNT)

  for (let i = 0; i < FIREFLY_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = Math.random() * 10 - 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    sizes[i] = Math.random() * 0.3 + 0.1
    phases[i] = Math.random() * Math.PI * 2
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSize;
      attribute float aPhase;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        pos.x += sin(uTime * 0.3 + aPhase) * 0.5;
        pos.y += sin(uTime * 0.5 + aPhase * 1.3) * 0.3;
        pos.z += cos(uTime * 0.4 + aPhase * 0.7) * 0.4;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPos;
        gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPos.z);
        vAlpha = 0.4 + 0.6 * sin(uTime * 1.5 + aPhase * 2.0) * sin(uTime * 0.8 + aPhase);
        vAlpha = max(vAlpha, 0.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, d);
        glow = pow(glow, 1.5);
        vec3 warmGold = vec3(0.83, 0.66, 0.33);
        vec3 softGreen = vec3(0.36, 0.60, 0.40);
        vec3 color = mix(softGreen, warmGold, glow);
        gl_FragColor = vec4(color, glow * vAlpha * 0.7);
      }
    `,
  })

  const points = new THREE.Points(geo, mat)
  scene.add(points)
  return { points, mat }
}

function createLeaves(scene: THREE.Scene) {
  const leaves: THREE.Mesh[] = []
  const leafGeo = new THREE.PlaneGeometry(0.15, 0.08)

  for (let i = 0; i < LEAF_COUNT; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.28 + Math.random() * 0.08, 0.5, 0.25 + Math.random() * 0.15),
      transparent: true,
      opacity: 0.15 + Math.random() * 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const leaf = new THREE.Mesh(leafGeo, mat)
    leaf.position.set(
      (Math.random() - 0.5) * 18,
      Math.random() * 12 - 2,
      (Math.random() - 0.5) * 18,
    )
    leaf.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    )
    leaf.userData.phase = Math.random() * Math.PI * 2
    leaf.userData.speed = 0.2 + Math.random() * 0.3
    scene.add(leaf)
    leaves.push(leaf)
  }
  return leaves
}

function createLightRays(scene: THREE.Scene) {
  const rays: THREE.Mesh[] = []
  const rayCount = 5
  for (let i = 0; i < rayCount; i++) {
    const w = 0.3 + Math.random() * 0.5
    const h = 12
    const geo = new THREE.PlaneGeometry(w, h)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xd4a853,
      transparent: true,
      opacity: 0.02 + Math.random() * 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const ray = new THREE.Mesh(geo, mat)
    ray.position.set((Math.random() - 0.5) * 14, 3, (Math.random() - 0.5) * 6 - 5)
    ray.rotation.z = (Math.random() - 0.5) * 0.3
    ray.userData.phase = Math.random() * Math.PI * 2
    scene.add(ray)
    rays.push(ray)
  }
  return rays
}

export default function ForestScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const init = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    /* Respect reduced-motion preference */
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const w = container.clientWidth
    const h = container.clientHeight

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(FOG_COLOR, 0)
    container.appendChild(renderer.domElement)

    /* Scene + Camera */
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(FOG_COLOR, 0.06)

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 50)
    camera.position.set(0, 2, 8)
    camera.lookAt(0, 1, 0)

    /* Objects */
    const { mat: fireflyMat } = createFireflies(scene)
    const leaves = createLeaves(scene)
    const rays = createLightRays(scene)

    /* Animation loop */
    const clock = new THREE.Clock()
    let frameId: number

    function animate() {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      /* Fireflies */
      fireflyMat.uniforms.uTime.value = t

      /* Leaves: slow drift down + wobble */
      for (const leaf of leaves) {
        const p = leaf.userData.phase as number
        const s = leaf.userData.speed as number
        leaf.position.y -= s * 0.003
        leaf.position.x += Math.sin(t * 0.5 + p) * 0.002
        leaf.rotation.x += 0.003
        leaf.rotation.z += 0.002
        if (leaf.position.y < -3) leaf.position.y = 10
      }

      /* Light rays: subtle pulse */
      for (const ray of rays) {
        const p = ray.userData.phase as number
        const mat = ray.material as THREE.MeshBasicMaterial
        mat.opacity = 0.02 + Math.sin(t * 0.3 + p) * 0.015
      }

      /* Gentle camera sway */
      camera.position.x = Math.sin(t * 0.1) * 0.3
      camera.position.y = 2 + Math.sin(t * 0.15) * 0.15
      camera.lookAt(0, 1, 0)

      renderer.render(scene, camera)
    }
    animate()

    /* Resize handler */
    function onResize() {
      if (!container) return
      const cw = container.clientWidth
      const ch = container.clientHeight
      camera.aspect = cw / ch
      camera.updateProjectionMatrix()
      renderer.setSize(cw, ch)
    }
    window.addEventListener('resize', onResize)

    cleanupRef.current = () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      scene.clear()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    init()
    return () => { cleanupRef.current?.() }
  }, [init])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="forest-scene"
    />
  )
}
