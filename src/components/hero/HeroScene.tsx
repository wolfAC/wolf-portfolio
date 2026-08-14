import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'

interface HeroSceneProps {
  x: MotionValue<number>
  y: MotionValue<number>
}

const PLANE_SIZE = 8
const SEGMENTS = 40

// Matches --color-fg-muted / --color-accent from index.css — kept as plain
// hex since this file lives outside the CSS var-aware DOM tree (WebGL
// materials read raw color values, not custom properties).
const MUTED_COLOR = new THREE.Color('#9a9a9f')
const ACCENT_COLOR = new THREE.Color('#ff4d1c')
const tmpColor = new THREE.Color()

/** A 3D evolution of HeroCursorField's flat CSS grid: the same "ambient
 * grid" idea, now a wireframe floor with real depth — a gentle continuous
 * wave, plus a bump that rises and glows accent-colored under the cursor.
 * Reads x/y imperatively via MotionValue.get() inside useFrame so this
 * shares the exact spring-smoothed pointer data Hero.tsx already produces,
 * with zero extra pointer-tracking code and no React re-renders per frame. */
function WireframePlane({ x, y }: HeroSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const basePositions = useRef<Float32Array | null>(null)

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    const geometry = mesh.geometry
    const posAttr = geometry.attributes.position as THREE.BufferAttribute

    // Lazy one-time setup: snapshot the flat plane's rest positions, and add
    // a per-vertex color attribute (starts fully muted) to lerp toward the
    // accent color near the cursor.
    if (!basePositions.current) {
      basePositions.current = Float32Array.from(posAttr.array as Float32Array)
      const colors = new Float32Array(posAttr.count * 3)
      for (let i = 0; i < posAttr.count; i++) {
        colors[i * 3] = MUTED_COLOR.r
        colors[i * 3 + 1] = MUTED_COLOR.g
        colors[i * 3 + 2] = MUTED_COLOR.b
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }

    const base = basePositions.current
    const colorAttr = geometry.attributes.color as THREE.BufferAttribute

    const time = state.clock.getElapsedTime()
    const pointerX = x.get()
    const pointerY = y.get()
    const pointerLocalX = pointerX * (PLANE_SIZE / 2)
    const pointerLocalY = -pointerY * (PLANE_SIZE / 2)

    for (let i = 0; i < posAttr.count; i++) {
      const bx = base[i * 3]
      const by = base[i * 3 + 1]

      const wave =
        Math.sin(bx * 0.6 + time * 0.5) * 0.12 + Math.cos(by * 0.5 + time * 0.4) * 0.12

      const dx = bx - pointerLocalX
      const dy = by - pointerLocalY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const bump = Math.max(0, 1 - distance / 2.4) * 0.9

      posAttr.setZ(i, wave + bump)

      const t = Math.min(1, bump / 0.9)
      tmpColor.copy(MUTED_COLOR).lerp(ACCENT_COLOR, t)
      colorAttr.setXYZ(i, tmpColor.r, tmpColor.g, tmpColor.b)
    }

    posAttr.needsUpdate = true
    colorAttr.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.15, 0, 0]} position={[0, -0.7, 0]}>
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE, SEGMENTS, SEGMENTS]} />
      <meshBasicMaterial vertexColors wireframe transparent opacity={0.5} />
    </mesh>
  )
}

/** Lazy-loaded (see Hero.tsx) so `three`/`@react-three/fiber` are only ever
 * fetched by the fine-pointer, high-power, WebGL-capable visitors who
 * qualify for it — never touches the main bundle for anyone else. */
export default function HeroScene({ x, y }: HeroSceneProps) {
  return (
    // Negative z-index (not just DOM order) so this always paints behind the
    // hero's foreground content — a plain `absolute` layer with z-index:auto
    // otherwise paints *after* non-positioned in-flow siblings per CSS
    // stacking rules, regardless of which comes first in the DOM (this hid
    // ScrollCue's text/arrow underneath the wireframe). The mask also fades
    // the mesh out near the bottom edge, where ScrollCue sits, so its small
    // text isn't fighting a dense wireframe right behind it.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.6, 3.4], fov: 50 }}
      >
        <WireframePlane x={x} y={y} />
      </Canvas>
    </div>
  )
}
