import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { buildFromPhoto, buildFallback } from './particle-engine.js'

// Single source of truth for intro progress, driven by the parent GSAP timeline.
// progress: 0..1 over exactly 10s. 0..0.6 = scattered drift, 0.6..1.0 = face reveal.
const Portrait = forwardRef(function Portrait({ imageSrc, onStatus }, ref) {
  const cv = useRef(null)
  const st = useRef({
    mode: 'run',
    list: [],
    progress: 0, // 0..1, set ONLY by parent timeline
    hasPhoto: false,
    startStamp: 0, // rAF timestamp of first frame (for drift phase, not reveal math)
    tSec: 0, // accumulated drift clock (capped dt — tab-switch safe)
    lastFrame: 0,
    w: 0,
    h: 0,
  })

  useImperativeHandle(
    ref,
    () => ({
      // Parent GSAP timeline calls this every tick with the eased 0..1 progress.
      setProgress(p) {
        const S = st.current
        S.progress = p < 0 ? 0 : p > 1 ? 1 : p
        S.mode = 'run'
      },
      loadFile(file) {
        if (!file) return
        const url = URL.createObjectURL(file)
        const im = new Image()
        im.onload = () => {
          try {
            const canvas = cv.current
            const small = Math.min(window.innerWidth, window.innerHeight) < 620
            st.current.list = buildFromPhoto(canvas, im, small)
            st.current.hasPhoto = true
            onStatus && onStatus('photo')
          } catch {
            st.current.hasPhoto = false
            onStatus && onStatus('missing')
          }
          URL.revokeObjectURL(url)
        }
        im.onerror = () => {
          URL.revokeObjectURL(url)
          onStatus && onStatus('missing')
        }
        im.src = url
      },
    }),
    [onStatus],
  )

  useEffect(() => {
    const canvas = cv.current
    if (!canvas) return
    // Graceful degradation: if Canvas 2D is unavailable the intro still plays
    // (letters + dot) and the site remains fully usable without particles.
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onStatus && onStatus('missing')
      return
    }
    const S = st.current
    let raf = 0
    let dead = false
    const small = Math.min(window.innerWidth, window.innerHeight) < 620
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // MOBILE PERF: cap DPR at 1.5 on small screens (4x fewer pixels than DPR 3).
    const DPR = small
      ? Math.min(window.devicePixelRatio || 1, 1.5)
      : Math.min(window.devicePixelRatio || 1, 2)

    function size() {
      const r = canvas.getBoundingClientRect()
      S.w = Math.max(2, Math.floor(r.width * DPR))
      S.h = Math.max(2, Math.floor(r.height * DPR))
      canvas.width = S.w
      canvas.height = S.h
    }
    size()
    const onResize = () => {
      size()
    } // no rebuild: targets are relative, resize-safe
    window.addEventListener('resize', onResize)

    function tryLoad(srcs, idx) {
      if (idx >= srcs.length) {
        S.list = buildFallback(canvas, small)
        S.hasPhoto = false
        onStatus && onStatus('missing')
        return
      }
      const im = new Image()
      im.onload = () => {
        try {
          S.list = buildFromPhoto(canvas, im, small)
          S.hasPhoto = true
          onStatus && onStatus('photo')
        } catch {
          tryLoad(srcs, idx + 1)
        }
      }
      im.onerror = () => tryLoad(srcs, idx + 1)
      im.src = srcs[idx]
    }
    tryLoad([imageSrc, '/images/krrish.png', '/images/krrish.jpeg'], 0)
    // Reveal mapping: progress 0..0.6 -> scattered (e=0 for every particle),
    // 0.6..1.0 -> smooth 0..1 travel to photo targets (SAME e for all particles).
    function revealE(p) {
      if (p <= 0.6) return 0
      const t = (p - 0.6) / 0.4
      return 1 - Math.pow(1 - t, 3)
    }

    // Precomputed per-frame constants live OUTSIDE the particle loop.
    function frame(now) {
      if (dead) return
      if (!S.startStamp) S.startStamp = now
      // ACCUMULATED CLOCK: capped dt keeps drift smooth and prevents position
      // jumps after a hidden tab (rAF gaps) or a StrictMode remount — the
      // animation state always stays coherent. GSAP's timeline pauses itself
      // when the tab is hidden, so both clocks resume together.
      const dt = S.lastFrame ? Math.min((now - S.lastFrame) / 1000, 0.05) : 0
      S.lastFrame = now
      S.tSec += dt
      const tSec = S.tSec
      const cw = S.w
      const ch = S.h
      const halfW = cw / 2
      const cy = ch * 0.44
      ctx.clearRect(0, 0, cw, ch)
      const n = S.list.length

      if (!n) {
        // photo still loading: ambient starfield only (140 rects, no allocations)
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        for (let i = 0; i < 140; i++) {
          const x = (((i * 197.3 + tSec * 10) % cw) + cw) % cw
          const y = (i * 331.7) % ch
          ctx.globalAlpha = 0.1 + 0.1 * Math.sin(tSec * 1.6 + i)
          ctx.fillRect(x, y, DPR, DPR)
        }
        ctx.globalAlpha = 1
        raf = requestAnimationFrame(frame)
        return
      }

      const e = revealE(S.progress)
      const scattered = e <= 0
      const formed = e >= 1
      // one branch for the whole frame, not per particle
      const driftSpd = scattered ? 0.55 : 0.35
      const wobAmp = reduced
        ? 0
        : formed
          ? 1.1 * DPR
          : 5.6 * DPR * (1 - e) + 0.44 * DPR
      const wobF1 = reduced ? 0 : 1.1
      const wobF2 = reduced ? 0 : 0.9
      // COLOUR CROSSFADE: scatter = white/silver (matching the chrome look),
      // reveal = each particle's own sampled photo RGB.
      const useOrbitWobble = !reduced && !formed
      const useHoldWobble = !reduced && formed
      const colorStage = e < 0.25 ? 0 : e < 0.7 ? 1 : 2
      const maxDim = cw > ch ? cw : ch

      for (let k = 0; k < n; k++) {
        const p = S.list[k]
        const ang = p.orbitA + tSec * driftSpd * p.orbitDir
        // NORMALIZED targets/orbits x LIVE canvas size -> resize-safe portrait
        const R = p.orbitR * maxDim
        const sx = halfW + Math.cos(ang) * R
        const sy = cy + Math.sin(ang) * R * 0.6
        const tx = p.tx * cw
        const ty = p.ty * ch
        let x = sx + (tx - sx) * e
        let y = sy + (ty - sy) * e
        if (useHoldWobble) {
          x += Math.sin(tSec * 2.5 + p.wob) * wobAmp
          y += Math.cos(tSec * 2.142 + p.wob * 1.3) * wobAmp
        } else if (useOrbitWobble) {
          x += Math.sin(tSec * wobF1 + p.wob) * wobAmp
          y += Math.cos(tSec * wobF2 + p.wob * 1.3) * wobAmp
        }
        ctx.globalAlpha = p.b
        if (p.c1 === null || colorStage === 0) {
          // missing-photo fallback OR scatter phase: white/silver look
          ctx.fillStyle = p.b > 0.68 ? '#ffffff' : p.b > 0.45 ? '#d7d7de' : '#a9a9b4'
        } else if (colorStage === 1) {
          ctx.fillStyle = p.cm // white -> true-colour midpoint
        } else {
          ctx.fillStyle = p.c1 // exact sampled photo RGB
        }
        const sz = p.s * DPR
        ctx.fillRect(x, y, sz, sz)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      dead = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [imageSrc, onStatus])

  return <canvas id="particle-canvas" ref={cv} aria-hidden="true" />
})
export default Portrait
