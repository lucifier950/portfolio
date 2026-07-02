import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

/**
 * SkillsGalaxy — your skills as a cinematic miniature solar system.
 *
 * Design decisions (the "why"):
 *  - PROCEDURAL textures (canvas-generated gas-giant bands, rocky blotches,
 *    ice caps, Great Red Spot, Earth clouds) instead of photo textures, so
 *    there are zero external image downloads — fast, reliable, offline-safe.
 *  - BLOOM postprocessing is the biggest "expensive" lever: it makes the sun
 *    and atmospheres glow with light bleed, the thing that reads as cinematic.
 *  - Real orbital MOTION with per-orbit inclination + a self-rotating sun &
 *    planets, lit by a single central light = believable celestial mechanics.
 *  - A floating CameraRig adds subtle, never-jarring life.
 */

// ---------- procedural texture helpers ----------
const hexTo255 = (hex) => {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const lerp = (a, b, t) => a + (b - a) * t
const samplePalette = (cols, v) => {
  const n = cols.length - 1
  const f = Math.min(0.9999, Math.max(0, v)) * n
  const i = Math.floor(f)
  const t = f - i
  const a = cols[i]
  const b = cols[Math.min(n, i + 1)]
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
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
      if (bands) {
        v = 0.5 + 0.34 * Math.sin(y * bands * 0.05 + Math.sin(x * 0.015) * 1.6) + 0.14 * Math.sin(y * 0.22)
      } else {
        v = 0.5 + 0.3 * Math.sin(x * 0.045 + y * 0.03) + 0.2 * Math.sin(x * 0.013 - y * 0.022)
      }
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

// Real texture sources. Earth/Moon-grade maps come from the three.js CDN
// (reliable, CORS-enabled). Gas giants try Solar System Scope and fall back
// to the procedural texture if the host blocks CORS or is offline.
const THREEJS = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r169/examples/textures/planets'
const SSS = 'https://www.solarsystemscope.com/textures/download'

/**
 * useRealTexture — loads a remote texture with crossOrigin:anonymous and
 * RETURNS the procedural fallback until (and unless) the real one loads.
 * Because crossOrigin is set, a non-CORS host fails onError and we keep the
 * fallback — it can never taint the WebGL canvas.
 */
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
      () => {} // on error: keep the procedural fallback
    )
    return () => {
      active = false
    }
  }, [url])
  return tex
}

// category index → planet type (real texture URL + procedural fallback)
const PLANETS = [
  // Earth — full PBR: day map + normal + drifting clouds (three.js CDN)
  {
    atmosphere: '#5aa2ff',
    url: `${THREEJS}/earth_atmos_2048.jpg`,
    normalUrl: `${THREEJS}/earth_normal_2048.jpg`,
    cloudUrl: `${THREEJS}/earth_clouds_2048.png`,
    clouds: true,
    tex: { palette: ['#0a2a6b', '#1763c4', '#2e8b57', '#6b4b2a', '#2e8b57'], poles: true },
  },
  // Jupiter
  {
    atmosphere: '#d9b483',
    url: `${SSS}/2k_jupiter.jpg`,
    tex: { palette: ['#7a4a2a', '#caa46a', '#efdcb4', '#b9824f', '#8a5a32'], bands: 5, spot: true },
  },
  // Neptune
  {
    atmosphere: '#3fa0e0',
    url: `${SSS}/2k_neptune.jpg`,
    tex: { palette: ['#16306b', '#225fb0', '#3fa0e0', '#1b3a8c'], bands: 3 },
  },
  // Mars
  {
    atmosphere: '#e08a52',
    url: `${SSS}/2k_mars.jpg`,
    tex: { palette: ['#5a2a16', '#a8502a', '#d98a4f', '#7a3b1e'], poles: true },
  },
  // Saturn (with ring)
  {
    atmosphere: '#e8dcc0',
    url: `${SSS}/2k_saturn.jpg`,
    ring: true,
    tex: { palette: ['#9c7a4a', '#d8c290', '#efe6cd', '#b89a6a'], bands: 6 },
  },
]

function Glow({ color, scale, opacity = 0.28 }) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function Planet({ category, index, total }) {
  const orbitRef = useRef()
  const meshRef = useRef()
  const cloudRef = useRef()
  const [hovered, setHovered] = useState(false)

  const cfg = PLANETS[index % PLANETS.length]
  const procTexture = useMemo(() => makePlanetTexture(cfg.tex), [index])
  const procClouds = useMemo(() => (cfg.clouds ? makeCloudTexture() : null), [index])

  // Real textures (with procedural fallback until they load / if CORS blocks).
  const texture = useRealTexture(cfg.url, procTexture)
  const normalMap = useRealTexture(cfg.normalUrl, null, false)
  const clouds = useRealTexture(cfg.cloudUrl, procClouds, true)

  const radius = 2.0 + index * 1.25
  const speed = 0.24 - index * 0.028
  const startAngle = (index / total) * Math.PI * 2
  const size = 0.6 + index * 0.1
  const axisTilt = 0.3 + (index % 3) * 0.15
  const inclination = (index % 2 === 0 ? 1 : -1) * (0.06 + index * 0.03) // orbit tilt

  useFrame((_, delta) => {
    // Hover eases the orbit to a near-stop for a "focus" feel.
    const orbitSpeed = hovered ? speed * 0.1 : speed
    if (orbitRef.current) orbitRef.current.rotation.y += delta * orbitSpeed
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.35
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.5 // clouds drift faster
  })

  return (
    <group rotation={[inclination, 0, 0]}>
      {/* Orbit ring lives in the inclined plane so it matches the path. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.012, radius + 0.012, 96]} />
        <meshBasicMaterial color="#2b4a7e" side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>

      <group ref={orbitRef} rotation={[0, startAngle, 0]}>
        <group
          position={[radius, 0, 0]}
          scale={hovered ? 1.18 : 1}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = ''
          }}
        >
          <mesh ref={meshRef} rotation={[axisTilt, 0, 0]}>
            <sphereGeometry args={[size, 64, 64]} />
            {/* key forces a clean rebuild when the normal map finishes loading
                (null → texture changes the shader, which needs a recompile). */}
            <meshStandardMaterial
              key={`${texture.uuid}-${normalMap ? normalMap.uuid : 'n'}`}
              map={texture}
              normalMap={normalMap || undefined}
              roughness={0.9}
              metalness={0}
            />
          </mesh>

          {/* Earth's drifting cloud layer */}
          {clouds && (
            <mesh ref={cloudRef} rotation={[axisTilt, 0, 0]} scale={1.02}>
              <sphereGeometry args={[size, 48, 48]} />
              <meshStandardMaterial map={clouds} transparent opacity={0.55} depthWrite={false} />
            </mesh>
          )}

          {/* Atmospheric halo + a soft light that switches on when hovered */}
          <Glow color={cfg.atmosphere} scale={size * (hovered ? 1.75 : 1.45)} opacity={hovered ? 0.4 : 0.26} />
          {hovered && <pointLight color="#8ec5ff" intensity={2.4} distance={4.5} />}

          {cfg.ring && (
            <mesh rotation={[Math.PI / 2.2, 0.25, 0]}>
              <torusGeometry args={[size * 1.8, size * 0.06, 18, 90]} />
              <meshStandardMaterial color="#e8dcc0" emissive="#caa46a" emissiveIntensity={0.25} roughness={0.6} />
            </mesh>
          )}

          {hovered && (
            <Html center distanceFactor={10} position={[0, size + 0.7, 0]}>
              <div className="planet-label planet-label--active">
                <span className="planet-label__title">{category.title}</span>
                <span className="planet-label__skills">{category.skills.join(' · ')}</span>
              </div>
            </Html>
          )}
        </group>
      </group>
    </group>
  )
}

function Sun() {
  const surfaceRef = useRef()
  const haloRef = useRef()
  const sunTex = useMemo(
    () => makePlanetTexture({ palette: ['#ff7a18', '#ffb347', '#fff0c2', '#ffae42'], bands: 7 }),
    []
  )
  useFrame((state, delta) => {
    if (surfaceRef.current) surfaceRef.current.rotation.y += delta * 0.08
    if (haloRef.current) {
      const s = 1.55 + Math.sin(state.clock.elapsedTime * 1.4) * 0.09
      haloRef.current.scale.setScalar(s)
    }
  })
  return (
    <group>
      {/* Emissive surface — bright enough that Bloom turns it into a glowing star */}
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshBasicMaterial map={sunTex} toneMapped={false} color="#fff2d6" />
      </mesh>
      <Glow color="#ffcf8a" scale={1.5} opacity={0.5} />
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial
          color="#ff9a3c"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3.6} distance={70} color="#fff2dd" />
    </group>
  )
}

function CosmicDust() {
  const ref = useRef()
  const positions = useMemo(() => {
    const n = 450
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 6 + Math.random() * 11
      const a = Math.random() * Math.PI * 2
      const b = (Math.random() - 0.5) * Math.PI
      arr[i * 3] = Math.cos(a) * Math.cos(b) * r
      arr[i * 3 + 1] = Math.sin(b) * r * 0.45
      arr[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r
    }
    return arr
  }, [])
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#9fc0ff" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const cam = state.camera
    // Subtle floating drift + pointer parallax; always re-centered on the sun.
    const tx = Math.sin(t * 0.15) * 0.7 + state.pointer.x * 1.6
    const ty = 2.6 + Math.sin(t * 0.2) * 0.35 + state.pointer.y * 0.8
    cam.position.x += (tx - cam.position.x) * 0.04
    cam.position.y += (ty - cam.position.y) * 0.04
    cam.position.z += (13 - cam.position.z) * 0.04
    cam.lookAt(0, 0, 0)
  })
  return null
}

function System({ categories }) {
  return (
    <group rotation={[0.35, 0, 0]}>
      <Sun />
      {categories.map((c, i) => (
        <Planet key={c.title} category={c} index={i} total={categories.length} />
      ))}
    </group>
  )
}

export default function SkillsGalaxy({ categories }) {
  return (
    <Canvas
      camera={{ position: [0, 2.6, 13], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <CosmicDust />
      <System categories={categories} />
      <CameraRig />

      {/* Bloom = the cinematic "glow" lever; Vignette focuses the eye. */}
      <EffectComposer>
        <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.35} luminanceSmoothing={0.4} />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
