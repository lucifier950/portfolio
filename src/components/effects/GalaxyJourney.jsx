import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * GalaxyJourney — a real 3D spiral particle galaxy you fly through on scroll.
 *
 * <Galaxy>: ~14k additive points laid out in spiral branches (the classic
 * generator: branch angle + radius-based spin + power-curved randomness), with
 * a color gradient from a hot blue-white core to a deep violet rim. It slowly
 * rotates on its own.
 *
 * <ScrollCamera>: maps page scroll (0→1) to a camera path that starts high and
 * outside (looking at the galaxy from above) and dives down toward/through the
 * galactic plane as you scroll — the "vertical journey into the Milky Way."
 * Mouse adds subtle parallax. Everything is eased (lerp) for cinematic weight.
 *
 * Canvas is transparent (alpha) so the deep-blue <html> gradient shows behind.
 */
const PARAMS = {
  count: 14000,
  radius: 10,
  branches: 4,
  spin: 1.15,
  randomness: 0.5,
  randomnessPower: 2.6,
  insideColor: '#9ecbff',
  outsideColor: '#4327a3',
}

function Galaxy() {
  const ref = useRef()

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(PARAMS.count * 3)
    const colors = new Float32Array(PARAMS.count * 3)
    const cInside = new THREE.Color(PARAMS.insideColor)
    const cOutside = new THREE.Color(PARAMS.outsideColor)

    for (let i = 0; i < PARAMS.count; i++) {
      const i3 = i * 3
      const radius = Math.random() * PARAMS.radius
      const branchAngle = ((i % PARAMS.branches) / PARAMS.branches) * Math.PI * 2
      const spinAngle = radius * PARAMS.spin

      // Power-curved scatter: tight near the arm, looser outward.
      const scatter = () =>
        Math.pow(Math.random(), PARAMS.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        PARAMS.randomness *
        radius

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + scatter()
      positions[i3 + 1] = scatter() * 0.5 // flatten vertically into a disc
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + scatter()

      const mixed = cInside.clone().lerp(cOutside, radius / PARAMS.radius)
      colors[i3] = mixed.r
      colors[i3 + 1] = mixed.g
      colors[i3 + 2] = mixed.b
    }
    return { positions, colors }
  }, [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.04
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARAMS.count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARAMS.count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        transparent
        opacity={0.9}
      />
    </points>
  )
}

function ScrollCamera() {
  const { camera } = useThree()
  const goal = useRef(new THREE.Vector3(0, 5, 9))
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5
      mouse.current.y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame(() => {
    const max = document.body.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0

    // Dive path: high & far (0,5,9) → down through the plane (~0,-1.2,0.6),
    // with a gentle lateral sweep so it doesn't feel like a straight rail.
    const x = Math.sin(p * Math.PI) * 1.6 + mouse.current.x * 1.4
    const y = 5 - p * 6.2 + mouse.current.y * 0.8
    const z = 9 - p * 8.4
    goal.current.set(x, y, z)
    camera.position.lerp(goal.current, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return null
}

export default function GalaxyJourney() {
  return (
    <Canvas
      camera={{ position: [0, 5, 9], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <Galaxy />
      <ScrollCamera />
    </Canvas>
  )
}
