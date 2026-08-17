import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTransform, type MotionValue } from 'framer-motion'
import { site } from '../../data/site'

interface HeroSceneProps {
  x: MotionValue<number>
  y: MotionValue<number>
  scrollYProgress: MotionValue<number>
}

// The same 5 entries and order the Living System Diagram's skill tier uses
// (`LivingSystemDiagram.tsx`'s `buildPositions` places them in this exact
// `coreStack` order too) — not literal shared pixel coordinates (this is
// WebGL, the diagram is SVG much further down the page, different
// coordinate spaces entirely), but the same top-to-bottom identity
// ordering, so a visitor who scrolls the hero apart and later reaches the
// diagram recognizes the sequence.
const SKILLS = site.coreStack

// Group sits offset to the right (in local/group space, added on top of
// GROUP_POSITION below) so the cluster clears the hero's name/role/tagline
// text instead of sitting on top of it — confirmed by screenshot: at the
// original centered position the orbit nodes directly overlapped
// "PRODUCT ENGINEER."
const GROUP_POSITION: [number, number, number] = [1.55, 0.1, 0]
const HUB_RADIUS = 0.42
const ORBIT_RADIUS = 0.8
const ORBIT_SPEED = 0.15
const EXPLODE_X = 0.95
const EXPLODE_Z = 0.3
const EXPLODE_Y_TOP = 0.85
const EXPLODE_Y_BOTTOM = -0.85

// Matches --color-cyan / --color-accent from index.css — kept as plain hex
// since this file lives outside the CSS var-aware DOM tree (WebGL
// materials read raw color values, not custom properties). The previous
// version of this file had drifted to the *pre-1a* palette (`#9a9a9f`/
// `#ff4d1c`) because a raw-hex WebGL constant isn't reachable by a
// CSS-variable grep sweep — fixed here by construction, not patched.
const CYAN = new THREE.Color('#8fd8ff')
const AMBER = new THREE.Color('#ff9f45')
const tmpColor = new THREE.Color()
const tmpVec = new THREE.Vector3()

interface SystemCoreProps extends HeroSceneProps {
  /** Called once per node per frame with its projected screen position and
   * opacity. `SystemCore` never touches the label DOM nodes directly — the
   * refs live in, and are only ever mutated by, `HeroScene`'s own closure
   * below. Passing the ref array itself as a prop and mutating its
   * contents here would trip this project's `react-hooks/immutability`
   * lint rule (mutating anything reachable from a prop, ref objects
   * included, is treated as unsafe under React Compiler's assumptions). */
  onLabelUpdate: (index: number, leftPercent: number, topPercent: number, opacity: number) => void
}

/** The hero's "system core": a wireframe icosahedron hub with 5 orbiting
 * nodes, one per `coreStack` skill. At rest they slowly circle the hub in
 * Drafting Cyan; as `scrollYProgress` advances (the same value `Hero.tsx`
 * already computes for its background grid drift — no second `useScroll`
 * here) they disperse into a vertical column and shift to Signal Amber,
 * previewing "this becomes the Living System Diagram" before the visitor
 * ever reaches it. Reads x/y/explodeProgress imperatively via
 * `MotionValue.get()` inside `useFrame`, same discipline the previous
 * cursor-bump version of this file used — zero React re-renders per
 * frame. */
function SystemCore({ x, y, scrollYProgress, onLabelUpdate }: SystemCoreProps) {
  const groupRef = useRef<THREE.Group>(null)
  const hubRef = useRef<THREE.Mesh>(null)
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([])
  const { camera } = useThree()

  // Compressed into the first 40% of the hero's own scroll-past range: at
  // the raw 1:1 mapping, most of the explode happened while the hero was
  // already sliding out from under the mask fade near the bottom of its
  // scroll range (confirmed by screenshot — by 70% scrolled, the hero was
  // mostly off-screen already), wasting the reveal. Finishing by 40% means
  // the fully-dispersed state is actually visible for a while before the
  // section scrolls away.
  const explodeProgress = useTransform(scrollYProgress, [0, 0.4], [0, 1])

  useFrame((state) => {
    const group = groupRef.current
    if (!group) return

    const time = state.clock.getElapsedTime()
    const explode = explodeProgress.get()

    // Subtle whole-cluster tilt from pointer position — "parallax, not
    // full orbit controls," per the spec. Applied to the group, not
    // per-node, so the cluster reads as one object being nudged.
    group.rotation.y = x.get() * 0.3
    group.rotation.x = y.get() * 0.2

    if (hubRef.current) {
      hubRef.current.rotation.y = time * 0.1
      hubRef.current.rotation.x = time * 0.05
    }

    const count = SKILLS.length
    for (let i = 0; i < count; i++) {
      const mesh = nodeRefs.current[i]
      if (!mesh) continue

      const angle = (i / count) * Math.PI * 2 + time * ORBIT_SPEED
      const orbitX = Math.cos(angle) * ORBIT_RADIUS
      const orbitY = Math.sin(angle) * ORBIT_RADIUS * 0.6
      const orbitZ = Math.sin(angle) * 0.3

      const targetY =
        count === 1 ? 0 : EXPLODE_Y_TOP + (EXPLODE_Y_BOTTOM - EXPLODE_Y_TOP) * (i / (count - 1))

      mesh.position.set(
        orbitX + (EXPLODE_X - orbitX) * explode,
        orbitY + (targetY - orbitY) * explode,
        orbitZ + (EXPLODE_Z - orbitZ) * explode,
      )

      const material = mesh.material as THREE.MeshBasicMaterial
      tmpColor.copy(CYAN).lerp(AMBER, explode)
      material.color.copy(tmpColor)

      tmpVec.copy(mesh.position)
      group.localToWorld(tmpVec)
      tmpVec.project(camera)
      const screenXPercent = (tmpVec.x * 0.5 + 0.5) * 100
      const screenYPercent = (-tmpVec.y * 0.5 + 0.5) * 100
      // Invisible at rest, fades in as the cluster disperses — the idle
      // hero stays clean, labels read as a reveal rather than clutter.
      const opacity = Math.max(0, Math.min(1, (explode - 0.15) / 0.85))
      onLabelUpdate(i, screenXPercent, screenYPercent, opacity)
    }
  })

  return (
    <group ref={groupRef} position={GROUP_POSITION}>
      <mesh ref={hubRef}>
        <icosahedronGeometry args={[HUB_RADIUS, 0]} />
        <meshBasicMaterial color="#8fd8ff" wireframe transparent opacity={0.6} />
      </mesh>
      {SKILLS.map((skill, i) => (
        <mesh
          key={skill}
          ref={(el) => {
            nodeRefs.current[i] = el
          }}
        >
          {i % 2 === 0 ? (
            <octahedronGeometry args={[0.07, 0]} />
          ) : (
            <boxGeometry args={[0.1, 0.1, 0.1]} />
          )}
          <meshBasicMaterial color="#8fd8ff" transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

/** Lazy-loaded (see Hero.tsx) so `three`/`@react-three/fiber` are only ever
 * fetched by the fine-pointer, high-power, WebGL-capable visitors who
 * qualify for it — never touches the main bundle for anyone else. */
export default function HeroScene({ x, y, scrollYProgress }: HeroSceneProps) {
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])

  function handleLabelUpdate(index: number, leftPercent: number, topPercent: number, opacity: number) {
    const label = labelRefs.current[index]
    if (!label) return
    label.style.left = `${leftPercent}%`
    label.style.top = `${topPercent}%`
    label.style.opacity = String(opacity)
  }

  return (
    // Negative z-index (not just DOM order) so this always paints behind the
    // hero's foreground content — a plain `absolute` layer with z-index:auto
    // otherwise paints *after* non-positioned in-flow siblings per CSS
    // stacking rules, regardless of which comes first in the DOM (this hid
    // ScrollCue's text/arrow underneath the wireframe). The mask also fades
    // the mesh out near the bottom edge, where ScrollCue sits, so its small
    // text isn't fighting the scene right behind it.
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
        <SystemCore
          x={x}
          y={y}
          scrollYProgress={scrollYProgress}
          onLabelUpdate={handleLabelUpdate}
        />
      </Canvas>
      {SKILLS.map((skill, i) => (
        <span
          key={skill}
          ref={(el) => {
            labelRefs.current[i] = el
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-meta uppercase tracking-wide text-fg"
          style={{ opacity: 0 }}
        >
          {skill}
        </span>
      ))}
    </div>
  )
}
