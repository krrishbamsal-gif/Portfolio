import { sampleImageToPoints } from './particles-helpers.js'

// Build particle list from YOUR REAL PHOTO pixels. Returns array.
// Deterministic orbits: each particle gets an orbit anchor derived from its
// index (not just random), so Phase 1 looks like intentional cinematic drift
// and Phase 2 converges cleanly onto the real face.
export function buildFromPhoto(canvas, img, isMobile) {
  const pts = sampleImageToPoints(img, isMobile ? 260 : 340)
  const cw = canvas.width
  const ch = canvas.height
  // FACE FIRST: portrait takes the UPPER 78% of canvas, big and centered.
  // PORTFOLIO text sits in bottom strip only -> face never hidden behind text.
  // NORMALIZED 0..1 coordinates: the frame loop multiplies by the LIVE canvas
  // size every tick, so window resizing never corrupts or shifts the portrait.
  const boxH = 0.78
  const boxW = Math.min(0.98, boxH * (pts.W / pts.H) * (ch / cw))
  const ox = (1 - boxW) / 2
  const oy = 0
  const max = isMobile ? 9000 : 28000
  // Mobile uses 8000 (not 18000): stride-picking below spreads them evenly over
  // the WHOLE face, so eyes/nose/mouth/hair stay recognizable at ~1/3 the cost.
  // Collect EVERY non-white pixel first, then stride-pick evenly across the
  // whole image. (Stopping early in scan order would cut off the lower face.)
  const candidates = []
  for (let y = 0; y < pts.H; y += 1) {
    for (let x = 0; x < pts.W; x += 1) {
      const i = (y * pts.W + x) * 4
      const r = pts.data[i]
      const g = pts.data[i + 1]
      const b = pts.data[i + 2]
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      if (lum > 0.93) continue // only pure-white background skipped -> full head + shoulders kept
      candidates.push({ x, y, r, g, b, lum })
    }
  }
  const total = candidates.length
  const stride = total > max ? total / max : 1
  const count = Math.min(total, max)
  const out = []
  // Lift shadows slightly so dark hair reads on pure black, without shifting hue.
  // lift(v) is computed ONCE here at init — never per frame.
  const lift = (v) => {
    const t = v + (255 - v) * 0.08 + 10
    return t > 255 ? 255 : Math.floor(t)
  }
  const golden = 2.399963
  for (let n = 0; n < count; n++) {
    const c = candidates[Math.floor(n * stride)]
    const depth = 1 - c.lum
    // ORIGINAL PHOTO COLOUR for this exact pixel (precomputed strings, reused every frame)
    const cr = lift(c.r)
    const cg = lift(c.g)
    const cb = lift(c.b)
    const c1 = 'rgb(' + cr + ',' + cg + ',' + cb + ')'
    // mid-blend between white scatter look and true colour -> smooth crossfade
    const cm = 'rgb(' + ((255 + cr) >> 1) + ',' + ((255 + cg) >> 1) + ',' + ((255 + cb) >> 1) + ')'
    // golden-angle orbit: even, cinematic spread (not clumpy random).
    // orbitR is a FRACTION of the canvas' larger side — resolved per frame,
    // so scatter stays proportional on any screen size.
    const orbitA = (n * golden) % (Math.PI * 2)
    const ring = 0.30 + 0.55 * ((n * 0.618034) % 1)
    out.push({
      tx: ox + (c.x / pts.W) * boxW, // normalized 0..1 (resize-safe)
      ty: oy + (c.y / pts.H) * boxH, // normalized 0..1 (resize-safe)
      orbitA,
      orbitR: ring * 0.44,
      orbitDir: n % 2 === 0 ? 1 : -1,
      // FACE LEGIBILITY: bright skin tones get a size + alpha boost so the
      // face plane reads solid; dark features (eyes/brows/hair) stay sharp
      // deep-black anchors. Without this the face looks sparse and dim.
      b: 0.55 + depth * 0.45,
      s: 1.15 + depth * 1.35 + (c.lum > 0.5 ? 0.85 : 0) + Math.random() * 0.4,
      wob: Math.random() * 6.28,
      c1,
      cm,
    })
  }
  return out
}

// Only used when the real photo file is missing.
// Abstract star burst — deliberately NOT a letter or face, so nobody
// mistakes it for the feature. Real photo replaces this entirely.
export function buildFallback(canvas, isMobile) {
  const out = []
  const n = isMobile ? 2500 : 4500
  for (let i = 0; i < n; i++) {
    const orbitA = (i * 2.399963) % (Math.PI * 2)
    const ring = 0.32 + 0.68 * ((i * 0.618034) % 1)
    const orbitR = ring * 0.44 // normalized (resize-safe), same convention as buildFromPhoto
    out.push({
      tx: 0.5 + Math.cos(orbitA) * orbitR * 0.5, // normalized 0..1
      ty: 0.38 + Math.sin(orbitA) * orbitR * 0.4, // normalized 0..1
      orbitA,
      orbitR,
      orbitDir: i % 2 === 0 ? 1 : -1,
      b: 0.4 + Math.random() * 0.35,
      s: 0.6 + Math.random() * 1.1,
      wob: Math.random() * 6,
      c1: null,
      cm: null,
    })
  }
  return out
}
