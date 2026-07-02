import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * SkillsGalaxy — an immersive, single-scene "Core Strengths" solar system.
 *
 * Two states, one continuous space experience (no navigation away):
 *  - OVERVIEW: a tight constellation of six category planets around the sun.
 *  - GALAXY: "View All Skills" flies the camera outward (GSAP), the planets
 *    spread apart, and every technology fades in as a moon orbiting its
 *    category planet.
 *
 * Interactions: hover enlarges a planet, click flies the camera to it, ESC
 * returns to the overview, drag rotates the whole system, and pointer motion
 * adds parallax. GSAP tweens a plain camera-target object that useFrame reads,
 * so tweens, drag, and parallax compose instead of fighting over the camera.
 */

// ---------- math + procedural texture helpers ----------
const hexTo255 = (hex) => {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const lerp = (a, b, t) => a + (b - a) * t
const deg = (d) => (d * Math.PI) / 180
const samplePalette = (cols, v) => {
  const n = cols.length - 1
  const f = Math.min(0.9999, Math.max(0, v)) * n
  const i = Math.floor(f)
  const t = f - i
  return [lerp(cols[i][0], cols[Math.min(n, i + 1)][0], t), lerp(cols[i][1], cols[Math.min(n, i + 1)][1], t), lerp(cols[i][2], cols[Math.min(n, i + 1)][2], t)]
}

function makePlanetTexture({ palette, bands, poles, spot }) {
  const w = 512
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const cols = palette.map(hexTo255)
  const img = ctx.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v
      if (bands) v = 0.5 + 0.34 * Math.sin(y * bands * 0.05 + Math.sin(x * 0.015) * 1.6) + 0.14 * Math.sin(y * 0.22)
      else v = 0.5 + 0.3 * Math.sin(x * 0.045 + y * 0.03) + 0.2 * Math.sin(x * 0.013 - y * 0.022)
      v += (Math.random() - 0.5) * 0.12
      let col = samplePalette(cols, v)
      if (poles) {
        const polar = (Math.abs(y - h / 2) / (h / 2) - 0.8) / 0.2
        if (polar > 0) {
          const m = Math.min(1, polar)
          col = [lerp(col[0], 245, m), lerp(col[1], 248, m), lerp(col[2], 255, m)]
        }
      }
      const idx = (y * w + x) * 4
      img.data[idx] = col[0]
      img.data[idx + 1] = col[1]
      img.data[idx + 2] = col[2]
      img.data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  if (spot) {
    const g = ctx.createRadialGradient(w * 0.7, h * 0.58, 2, w * 0.7, h * 0.58, 42)
    g.addColorStop(0, 'rgba(196, 86, 58, 0.95)')
    g.addColorStop(1, 'rgba(196, 86, 58, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(w * 0.7, h * 0.58, 42, 24, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  return tex
}

function makeCloudTexture() {
  const w = 512
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 10 + Math.random() * 38
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(255,255,255,${0.22 + Math.random() * 0.3})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// A soft round dot — used as the sprite for GPU point-stars so they render as
// glowing circles instead of hard squares.
function makeSoftSprite(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const s = 64
  const canvas = document.createElement('canvas')
  canvas.width = s
  canvas.height = s
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, inner)
  g.addColorStop(0.25, inner)
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const THREEJS = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r169/examples/textures/planets'
const SSS = 'https://www.solarsystemscope.com/textures/download'

function useRealTexture(url, fallback, srgb = true) {
  const [tex, setTex] = useState(fallback)
  useEffect(() => {
    if (!url) return
    let active = true
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      url,
      (t) => {
        if (!active) return
        if (srgb) t.colorSpace = THREE.SRGBColorSpace
        t.wrapS = THREE.RepeatWrapping
        t.anisotropy = 4
        setTex(t)
      },
      undefined,
      () => {}
    )
    return () => {
      active = false
    }
  }, [url])
  return tex
}

// NODES — the six category planets. Order lines up with the `categories` prop.
const NODES = [
  { angle: deg(118), radius: 4.35, size: 0.64, color: '#f5c451', ring: true, atmosphere: '#e8dcc0', url: `${SSS}/2k_saturn.jpg`, tex: { palette: ['#9c7a4a', '#d8c290', '#efe6cd', '#b89a6a'], bands: 6 } },
  { angle: deg(56), radius: 4.6, size: 0.58, color: '#b98cff', atmosphere: '#a97fe0', url: `${SSS}/2k_neptune.jpg`, tex: { palette: ['#3a1f6b', '#6d3fb0', '#a06fe0', '#4a2a8c'], bands: 3 } },
  { angle: deg(4), radius: 4.55, size: 0.55, color: '#f0894f', atmosphere: '#e08a52', url: `${SSS}/2k_mars.jpg`, tex: { palette: ['#5a2a16', '#a8502a', '#d98a4f', '#7a3b1e'], poles: true } },
  { angle: deg(-52), radius: 4.4, size: 0.57, color: '#57d977', atmosphere: '#6ee88a', tex: { palette: ['#153d1f', '#2f7d3f', '#5bbf5f', '#256e34'], bands: 4 } },
  { angle: deg(228), radius: 4.55, size: 0.53, color: '#38bdf8', atmosphere: '#38bdf8', clouds: true, url: `${THREEJS}/earth_atmos_2048.jpg`, normalUrl: `${THREEJS}/earth_normal_2048.jpg`, cloudUrl: `${THREEJS}/earth_clouds_2048.png`, tex: { palette: ['#0a2a6b', '#1763c4', '#2e8b57', '#6b4b2a', '#2e8b57'], poles: true } },
  { angle: deg(170), radius: 4.4, size: 0.51, color: '#4f9bff', atmosphere: '#5aa2ff', tex: { palette: ['#0b2e4a', '#155e86', '#4f9bff', '#0e4a6e'], bands: 3 } },
]

function Glow({ color, scale, opacity = 0.28 }) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

function Moon({ tech, j, total, planetSize, color, active, showLabel }) {
  const groupRef = useRef()
  const scaleRef = useRef(0)
  const orbitR = planetSize * 1.7 + 0.34 + j * 0.3
  const speed = 0.16 + j * 0.04
  const incl = (j % 2 ? 1 : -1) * (0.35 + j * 0.12)
  const phase = (j / total) * Math.PI * 2

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * speed + phase
    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(t) * orbitR, Math.sin(incl) * Math.sin(t) * orbitR, Math.cos(incl) * Math.sin(t) * orbitR)
      // Moons belong to galaxy / focus mode — fade + scale in when active.
      const target = active ? 1 : 0
      scaleRef.current += (target - scaleRef.current) * Math.min(1, delta * 6)
      groupRef.current.scale.setScalar(scaleRef.current)
      groupRef.current.visible = scaleRef.current > 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.7} />
      </mesh>
      <Glow color={color} scale={0.2} opacity={0.3} />
      {showLabel && (
        <Html center style={{ pointerEvents: 'none' }} zIndexRange={[18, 8]}>
          <span className="moon-label" style={{ color }}>
            {tech}
          </span>
        </Html>
      )}
    </group>
  )
}

function Planet({ node, category, index, hovered, setHovered, focusIndex, onFocus, expanded, expandRef, dragRef, camDist }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const cloudRef = useRef()
  const labelRef = useRef()
  const { camera, size } = useThree()
  const isHover = hovered === index
  const isFocused = focusIndex === index
  const moonsOn = expanded || isFocused
  const someoneFocused = focusIndex != null
  // When one planet is focused, only ITS label shows. Skill lists render only in
  // the overview (no focus, not expanded); focus/galaxy modes rely on the moons.
  const labelVisible = !someoneFocused || isFocused
  const showList = !someoneFocused && !expanded

  const procTexture = useMemo(() => makePlanetTexture(node.tex), [index])
  const procClouds = useMemo(() => (node.clouds ? makeCloudTexture() : null), [index])
  const texture = useRealTexture(node.url, procTexture)
  const normalMap = useRealTexture(node.normalUrl, null, false)
  const clouds = useRealTexture(node.cloudUrl, procClouds, true)
  const axisTilt = 0.28 + (index % 3) * 0.12
  const scaleTarget = isHover || isFocused ? 1.16 : 1
  const scaleRef = useRef(1)
  const world = useMemo(() => new THREE.Vector3(), [])
  const origin = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const spread = node.radius * expandRef.current.v // v goes 1 → 1.5
    // Focused planet holds still so the camera can settle on it.
    const wobble = isFocused ? 0 : Math.sin(t * 0.16 + index) * 0.045
    const a = node.angle + wobble
    const y = isFocused ? 0 : Math.sin(t * 0.55 + index * 1.7) * 0.14
    if (groupRef.current) groupRef.current.position.set(Math.cos(a) * spread, y, -Math.sin(a) * spread)

    scaleRef.current += (scaleTarget - scaleRef.current) * Math.min(1, delta * 8)
    const spin = isHover || isFocused ? 0.05 : 0.12
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * spin
      meshRef.current.scale.setScalar(scaleRef.current)
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * (spin + 0.2)
      cloudRef.current.scale.setScalar(scaleRef.current * 1.02)
    }

    // ----- dynamic label placement (never crosses the sun/planet) -----
    if (labelRef.current && groupRef.current) {
      groupRef.current.getWorldPosition(world)
      world.project(camera)
      const px = (world.x * 0.5 + 0.5) * size.width
      const ox = (origin.set(0, 0, 0).project(camera).x * 0.5 + 0.5) * size.width
      const side = px >= ox ? 'right' : 'left' // always fan away from center
      labelRef.current.dataset.side = side
      // planet's on-screen radius in px → push the label just past its edge
      const focal = size.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2))
      const dist = camDist.current || camera.position.length()
      const rpx = node.size * scaleRef.current * (focal / Math.max(1, dist))
      labelRef.current.style.setProperty('--off', `${rpx + 14}px`)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        rotation={[axisTilt, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(index)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered((h) => (h === index ? null : h))
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (dragRef.current.moved) return // this was a drag, not a click
          groupRef.current.getWorldPosition(world)
          onFocus(index, world.clone())
        }}
      >
        <sphereGeometry args={[node.size, 64, 64]} />
        <meshStandardMaterial key={`${texture.uuid}-${normalMap ? normalMap.uuid : 'n'}`} map={texture} normalMap={normalMap || undefined} roughness={0.9} metalness={0} />
      </mesh>

      {clouds && (
        <mesh ref={cloudRef} rotation={[axisTilt, 0, 0]}>
          <sphereGeometry args={[node.size, 48, 48]} />
          <meshStandardMaterial map={clouds} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      )}

      <Glow color={node.atmosphere || node.color} scale={node.size * (isHover || isFocused ? 1.85 : 1.5)} opacity={isHover || isFocused ? 0.4 : 0.24} />
      {(isHover || isFocused) && <pointLight color={node.color} intensity={2.4} distance={5} />}

      {node.ring && (
        <mesh rotation={[Math.PI / 2.2, 0.25, 0]}>
          <torusGeometry args={[node.size * 1.85, node.size * 0.05, 18, 96]} />
          <meshStandardMaterial color="#e8dcc0" emissive="#caa46a" emissiveIntensity={0.3} roughness={0.6} />
        </mesh>
      )}

      {/* Tech moons — appear in galaxy mode; labels only when this planet is active */}
      {category.techs?.map((tech, j) => (
        <Moon key={tech} tech={tech} j={j} total={category.techs.length} planetSize={node.size} color={node.color} active={moonsOn} showLabel={isHover || isFocused} />
      ))}

      {/* Category connector label — side + offset recomputed every frame.
          Hidden for non-focused planets while another planet is focused. */}
      {labelVisible && (
        <Html style={{ pointerEvents: 'none' }} zIndexRange={[20, 10]}>
          <div ref={labelRef} className={`ptag ${isHover || isFocused ? 'is-hover' : ''}`} data-side="right" style={{ color: node.color }}>
            <span className="ptag__dot" />
            <span className="ptag__line" />
            <div className="ptag__card">
              <span className="ptag__title">{category.title}</span>
              {showList && (
                <ul className="ptag__list">
                  {(category.top || category.techs || []).slice(0, 4).map((s) => (
                    <li className="ptag__skill" key={s}>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

const SUN_R = 1.24 // ~20% smaller than before

function Sun({ labelVisible = true }) {
  const surfaceRef = useRef()
  const haloRef = useRef()
  const sunTex = useMemo(() => makePlanetTexture({ palette: ['#ff7a18', '#ffb347', '#fff0c2', '#ffae42'], bands: 7 }), [])
  useFrame((state, delta) => {
    if (surfaceRef.current) surfaceRef.current.rotation.y += delta * 0.08
    if (haloRef.current) haloRef.current.scale.setScalar(SUN_R * (1.3 + Math.sin(state.clock.elapsedTime * 1.4) * 0.06))
  })
  return (
    <group>
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[SUN_R, 64, 64]} />
        <meshBasicMaterial map={sunTex} toneMapped={false} color="#fff2d6" />
      </mesh>
      <Glow color="#ffcf8a" scale={SUN_R * 1.3} opacity={0.3} />
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial color="#ff9a3c" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3.6} distance={90} color="#fff2dd" />
      {labelVisible && (
        <Html center style={{ pointerEvents: 'none' }} zIndexRange={[15, 5]}>
          <div className="core-label">
            <span className="core-label__title">Core Strengths</span>
            <span className="core-label__pill">Always Learning</span>
          </div>
        </Html>
      )}
    </group>
  )
}

// A bright dot that travels around a ring — the "light pulse".
function RingPulse({ radius, speed, phase, color }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase
    if (ref.current) ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius)
  })
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Glow color={color} scale={0.18} opacity={0.7} />
    </group>
  )
}

function Rings() {
  const radii = [2.5, 3.1, 3.7, 4.1, 4.55, 5.1, 5.7]
  const pulseColors = ['#f5c451', '#b98cff', '#57d977', '#38bdf8', '#f0894f', '#4f9bff', '#8ec5ff']
  return (
    <group>
      {radii.map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.003, r + 0.003, 160]} />
          <meshBasicMaterial color="#3a5a8f" side={THREE.DoubleSide} transparent opacity={0.14} />
        </mesh>
      ))}
      {radii.map((r, i) => (
        <RingPulse key={`p${i}`} radius={r} speed={0.1 + i * 0.02} phase={i * 1.3} color={pulseColors[i % pulseColors.length]} />
      ))}
    </group>
  )
}

// GPU point-stars rendered as soft round sprites (no square particles).
function Starfield() {
  const sprite = useMemo(() => makeSoftSprite(), [])
  const { positions, colors } = useMemo(() => {
    const n = 1400
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const tints = [[1, 1, 1], [0.75, 0.85, 1], [1, 0.9, 0.78]]
    for (let i = 0; i < n; i++) {
      const r = 30 + Math.random() * 45
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = Math.sin(b) * Math.cos(a) * r
      pos[i * 3 + 1] = Math.cos(b) * r
      pos[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r
      const c = tints[(Math.random() * tints.length) | 0]
      col[i * 3] = c[0]
      col[i * 3 + 1] = c[1]
      col[i * 3 + 2] = c[2]
    }
    return { positions: pos, colors: col }
  }, [])
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.004
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial map={sprite} size={0.5} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} alphaTest={0.01} />
    </points>
  )
}

// Soft additive nebula clouds far behind the system.
function Nebulae() {
  const clouds = useMemo(() => {
    const mk = (c) => makeSoftSprite(c, c.replace(/[\d.]+\)$/, '0)'))
    // Pushed far back, low opacity, biased to the lower corners so they read as
    // faint deep-space colour rather than blobs over the planets/panels.
    return [
      { tex: mk('rgba(120,90,220,0.5)'), pos: [-22, -14, -40], s: 22 },
      { tex: mk('rgba(40,120,220,0.5)'), pos: [26, -16, -44], s: 26 },
      { tex: mk('rgba(180,80,160,0.4)'), pos: [4, 18, -46], s: 20 },
    ]
  }, [])
  return (
    <group>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.s, c.s, 1]}>
          <spriteMaterial map={c.tex} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  )
}

// Occasional shooting stars: a glowing head with a stretched trail.
function ShootingStar({ seed }) {
  const ref = useRef()
  const state = useRef({ next: seed * 3, active: false, t: 0, from: new THREE.Vector3(), dir: new THREE.Vector3(), dur: 1 })
  useFrame((frame, delta) => {
    const s = state.current
    const time = frame.clock.elapsedTime
    if (!s.active) {
      if (time > s.next) {
        s.active = true
        s.t = 0
        s.dur = 0.7 + Math.random() * 0.6
        const edge = 22
        s.from.set((Math.random() - 0.5) * edge, 8 + Math.random() * 8, -6 - Math.random() * 8)
        s.dir.set(-0.6 - Math.random() * 0.5, -0.5 - Math.random() * 0.4, 0.1).normalize()
      } else if (ref.current) {
        ref.current.visible = false
        return
      }
    }
    if (s.active && ref.current) {
      s.t += delta
      const p = s.t / s.dur
      if (p >= 1) {
        s.active = false
        s.next = time + 4 + Math.random() * 7
        ref.current.visible = false
        return
      }
      ref.current.visible = true
      const travel = 26
      ref.current.position.copy(s.from).addScaledVector(s.dir, p * travel)
      ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), s.dir)
      const fade = Math.sin(p * Math.PI)
      ref.current.children.forEach((c) => {
        if (c.material) c.material.opacity = fade
      })
    }
  })
  return (
    <group ref={ref} visible={false}>
      <mesh position={[-1.1, 0, 0]}>
        <planeGeometry args={[2.4, 0.05]} />
        <meshBasicMaterial color="#bcd4ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * Scene — owns the camera, drag rotation, parallax, and focus/expand tweens.
 * GSAP writes to plain target objects (view.pos / view.look / expand.v); the
 * frame loop reads them and composes parallax + drag on top.
 */
function Scene({ categories, expanded, focusIndex, setFocusIndex }) {
  const { camera, gl } = useThree()
  const systemRef = useRef()
  const [hovered, setHovered] = useState(null)

  const view = useRef({ pos: new THREE.Vector3(0, 2.4, 17.5), look: new THREE.Vector3(0, 0, 0) })
  const expand = useRef({ v: 1 }) // 1 = overview spread, 1.5 = galaxy spread
  const rot = useRef({ x: 0.3, y: 0 }) // system group target rotation (drag)
  const parallax = useRef({ x: 0, y: 0 })
  const dragRef = useRef({ moved: false, down: false })
  const camDist = useRef(17.5)

  // Fly to a planet on click.
  const focusPlanet = (i, worldPos) => {
    setFocusIndex(i)
    // Pull back far enough to frame the planet AND its orbiting moons.
    const dir = worldPos.clone().setY(0).normalize()
    const target = worldPos.clone().add(dir.multiplyScalar(7))
    target.y += 2.2
    gsap.to(view.current.pos, { x: target.x, y: target.y, z: target.z, duration: 1.5, ease: 'power3.inOut' })
    gsap.to(view.current.look, { x: worldPos.x, y: worldPos.y, z: worldPos.z, duration: 1.5, ease: 'power3.inOut' })
  }

  // Camera state machine. focusPlanet() drives the fly-IN (it knows the live
  // planet position); this effect drives every non-focused view — overview,
  // galaxy, and the fly-BACK when focus is cleared (ESC / Back).
  useEffect(() => {
    if (focusIndex != null) return // fly-in handled by the click that set focus
    const z = expanded ? 25 : 17.5
    const y = expanded ? 3.6 : 2.4
    gsap.killTweensOf([view.current.pos, view.current.look, expand.current])
    gsap.to(view.current.pos, { x: 0, y, z, duration: 1.6, ease: 'power3.inOut' })
    gsap.to(view.current.look, { x: 0, y: 0, z: 0, duration: 1.6, ease: 'power3.inOut' })
    gsap.to(expand.current, { v: expanded ? 1.5 : 1, duration: 1.6, ease: 'power3.inOut' })
  }, [expanded, focusIndex])

  // Drag-to-rotate on the canvas (distinguishes drag from click via dragRef).
  useEffect(() => {
    const el = gl.domElement
    let lastX = 0
    let lastY = 0
    const down = (e) => {
      dragRef.current.down = true
      dragRef.current.moved = false
      lastX = e.clientX
      lastY = e.clientY
    }
    const move = (e) => {
      if (!dragRef.current.down) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      if (Math.abs(dx) + Math.abs(dy) > 3) dragRef.current.moved = true
      rot.current.y += dx * 0.005
      rot.current.x = THREE.MathUtils.clamp(rot.current.x + dy * 0.003, -0.15, 0.9)
      lastX = e.clientX
      lastY = e.clientY
    }
    const up = () => {
      dragRef.current.down = false
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])

  useFrame((frame) => {
    // Ease system rotation toward the drag target.
    if (systemRef.current) {
      systemRef.current.rotation.x += (rot.current.x - systemRef.current.rotation.x) * 0.08
      systemRef.current.rotation.y += (rot.current.y - systemRef.current.rotation.y) * 0.08
    }
    // Parallax: dampened when dragging or focused so it never fights the tween.
    const pf = focusIndex != null || dragRef.current.down ? 0.15 : 1
    parallax.current.x += (frame.pointer.x * 0.7 * pf - parallax.current.x) * 0.04
    parallax.current.y += (frame.pointer.y * 0.45 * pf - parallax.current.y) * 0.04
    camera.position.set(view.current.pos.x + parallax.current.x, view.current.pos.y + parallax.current.y, view.current.pos.z)
    camera.lookAt(view.current.look)
    camDist.current = camera.position.length()
  })

  return (
    <>
      <ambientLight intensity={0.42} />
      <Starfield />
      <Nebulae />
      <ShootingStar seed={1.3} />
      <ShootingStar seed={5.7} />
      <group ref={systemRef} rotation={[0.3, 0, 0]}>
        <Rings />
        <Sun labelVisible={focusIndex == null} />
        {NODES.map((node, i) => (
          <Planet
            key={categories[i]?.title || i}
            node={node}
            category={categories[i] || { title: '', techs: [] }}
            index={i}
            hovered={hovered}
            setHovered={setHovered}
            focusIndex={focusIndex}
            onFocus={focusPlanet}
            expanded={expanded}
            expandRef={expand}
            dragRef={dragRef}
            camDist={camDist}
          />
        ))}
      </group>
    </>
  )
}

export default function SkillsGalaxy({ categories, expanded = false, focusIndex = null, setFocusIndex, onExit }) {
  // ESC steps back: unfocus a planet first, then exit the galaxy to overview.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (focusIndex != null) setFocusIndex?.(null)
      else onExit?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusIndex, setFocusIndex, onExit])

  return (
    <Canvas camera={{ position: [0, 2.4, 17.5], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
      <Scene categories={categories} expanded={expanded} focusIndex={focusIndex} setFocusIndex={setFocusIndex} />
      {/* Bloom lowered + threshold raised so only the sun/pulses bleed — planets stay crisp */}
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0.66} luminanceSmoothing={0.35} />
        <Vignette eskil={false} offset={0.35} darkness={0.4} />
      </EffectComposer>
    </Canvas>
  )
}
