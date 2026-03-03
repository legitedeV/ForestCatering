'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import type { ForestAmbientConfig } from '@/lib/forest-ambient-config'
import { DEFAULT_FOREST_AMBIENT } from '@/lib/forest-ambient-config'

/* ─────────────────────────────────────────────
   ForestScene — Three.js WebGL background
   Fireflies · Floating leaves · Volumetric fog · Light rays
   Accepts config from ForestAmbient parent.
   ───────────────────────────────────────────── */

const FOG_COLOR = 0x1f242b

/** Parse hex color string to THREE.Color */
function hexToColor(hex: string): THREE.Color {
  try { return new THREE.Color(hex) } catch { return new THREE.Color(0xd4a853) }
}

function createFireflies(scene: THREE.Scene, count: number, color: THREE.Color) {
  if (count <= 0) return null
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)

  for (let i = 0; i < count; i++) {
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
      uColor: { value: new THREE.Vector3(color.r, color.g, color.b) },
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
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, d);
        glow = pow(glow, 1.5);
        vec3 softGreen = vec3(0.36, 0.60, 0.40);
        vec3 color = mix(softGreen, uColor, glow);
        gl_FragColor = vec4(color, glow * vAlpha * 0.7);
      }
    `,
  })

  const points = new THREE.Points(geo, mat)
  scene.add(points)
  return { points, mat }
}

function createLeaves(scene: THREE.Scene, count: number) {
  const leaves: THREE.Mesh[] = []
  if (count <= 0) return leaves
  const leafGeo = new THREE.PlaneGeometry(0.15, 0.08)

  for (let i = 0; i < count; i++) {
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

function createLightRays(scene: THREE.Scene, enabled: boolean, color: THREE.Color) {
  const rays: THREE.Mesh[] = []
  if (!enabled) return rays
  const rayCount = 5
  for (let i = 0; i < rayCount; i++) {
    const w = 0.3 + Math.random() * 0.5
    const h = 12
    const geo = new THREE.PlaneGeometry(w, h)
    const mat = new THREE.MeshBasicMaterial({
      color,
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

interface ForestSceneProps {
  config?: ForestAmbientConfig
}

export default function ForestScene({ config }: ForestSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const configRef = useRef(config ?? DEFAULT_FOREST_AMBIENT)

  // Update ref so animation loop always has latest config
  configRef.current = config ?? DEFAULT_FOREST_AMBIENT

  const init = useCallback(() => {
    // Clean up previous scene if any
    cleanupRef.current?.()
    cleanupRef.current = null

    const container = containerRef.current
    if (!container) return

    const cfg = configRef.current

    /* Respect reduced-motion preference */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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
    scene.fog = new THREE.FogExp2(FOG_COLOR, cfg.fogDensity)

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 50)
    camera.position.set(0, 2, 8)
    camera.lookAt(0, 1, 0)

    /* Objects */
    const fireflyColor = hexToColor(cfg.fireflyColor)
    const fireflyResult = createFireflies(scene, cfg.fireflyCount, fireflyColor)
    const leaves = createLeaves(scene, cfg.leafCount)
    const rayColor = hexToColor(cfg.lightRaysColor)
    const rays = createLightRays(scene, cfg.lightRaysEnabled, rayColor)

    /* Animation loop */
    const clock = new THREE.Clock()
    let frameId: number

    function animate() {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      /* Fireflies */
      if (fireflyResult) {
        fireflyResult.mat.uniforms.uTime.value = t
      }

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
      /* Update pixel ratio if moved to a different display */
      const newPR = Math.min(window.devicePixelRatio, 2)
      renderer.setPixelRatio(newPR)
      if (fireflyResult) fireflyResult.mat.uniforms.uPixelRatio.value = newPR
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

  // Initialize on mount
  useEffect(() => {
    init()
    return () => { cleanupRef.current?.() }
  }, [init])

  // Re-initialize when config changes (debounced)
  useEffect(() => {
    // Skip initial render (init already called)
    const timer = setTimeout(() => {
      init()
    }, 300)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config?.fireflyCount,
    config?.fireflyColor,
    config?.leafCount,
    config?.fogDensity,
    config?.lightRaysEnabled,
    config?.lightRaysColor,
  ])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="forest-scene"
    />
  )
}

