import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Portrait from './ParticlePortrait.jsx'

const WORD = 'PORTFOLIO'.split('')

export default function Intro({ onDone }) {
  const root = useRef(null)
  const portrait = useRef(null)
  const doneRef = useRef(false)
  const [photoState, setPhotoState] = useState('loading')

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    const el = root.current
    if (!el) {
      onDone && onDone()
      return
    }
    // Cinematic exit: portrait + text drift toward the viewer and dissolve,
    // revealing the portfolio beneath — never a hard cut.
    gsap.to(el, {
      opacity: 0,
      scale: 1.06,
      duration: 0.9,
      ease: 'power2.inOut',
      onComplete: () => onDone && onDone(),
    })
  }

  useEffect(() => {
    let cancelled = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Single driver object: GSAP owns it, canvas reads it. Nothing else touches timing.
    const driver = { p: 0 }
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray('.intro-word span')
      gsap.set('.intro', { opacity: 1 })
      gsap.set('.intro-dot', { opacity: 0, scale: 0.4 })
      // Letters fly in from varied 3D directions (matching the reference's
      // per-letter offsets: some from below, some from above/sides, each with
      // its own rotation) and settle into the word PORTFOLIO.
      const FROM = [
        { y: 340, x: -120, z: -620, rx: -82, ry: 38 },
        { y: -280, x: 90, z: -520, rx: 74, ry: -30 },
        { y: 300, x: -60, z: -700, rx: -70, ry: 24 },
        { y: -320, x: 140, z: -460, rx: 66, ry: -44 },
        { y: 380, x: 40, z: -580, rx: -76, ry: 18 },
        { y: -260, x: -150, z: -640, rx: 78, ry: 40 },
        { y: 320, x: 110, z: -500, rx: -68, ry: -22 },
        { y: -300, x: -80, z: -680, rx: 72, ry: 34 },
        { y: 360, x: 160, z: -540, rx: -74, ry: -38 },
      ]
      letters.forEach((l, i) => {
        const f = FROM[i % FROM.length]
        gsap.set(l, { opacity: 0, x: f.x, y: f.y, z: f.z, rotationX: f.rx, rotationY: f.ry })
      })
      gsap.set(['.intro-sub', '.intro-top'], { opacity: 0, y: 14 })
      gsap.set('#particle-canvas', { opacity: 0 })
      if (reduced) {
        // Accessible path: SAME exact 10s clock, motion removed (fade only).
        // Reducing motion must never shorten the intro — timing stays identical.
        letters.forEach((l) => gsap.set(l, { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, opacity: 0 }))
        gsap.set(['.intro-sub', '.intro-top'], { y: 0 })
        const tl = gsap.timeline({ onComplete: finish })
        tl.to(driver, { p: 0.6, duration: 6, ease: 'none',
            onUpdate: () => portrait.current && portrait.current.setProgress(driver.p) }, 0)
          .to(driver, { p: 1, duration: 3.5, ease: 'power1.inOut',
            onUpdate: () => portrait.current && portrait.current.setProgress(driver.p) }, 6)
          .to(driver, { p: 1, duration: 0.5 }, 9.5) // hold — SAME exact 10s clock
          .to('.intro-dot', { opacity: 1, duration: 0.5 }, 0.2)
          .to('.intro-dot', { opacity: 0, duration: 0.5 }, 1.4)
          .to('#particle-canvas', { opacity: 1, duration: 1.0 }, 0.8)
          .to(letters, { opacity: 1, duration: 1.0, stagger: 0.08 }, 1.2)
          .to(['.intro-sub', '.intro-top'], { opacity: 1, duration: 0.8 }, 3.2)
        return
      }
      // MASTER 10-SECOND TIMELINE — the ONLY clock driving the intro.
      // Phase 1 (0–6s):   driver.p 0 -> 0.6   — particles drift, scattered (NO face)
      // Phase 2 (6–9.5s): driver.p 0.6 -> 1  — particles converge onto the real photo
      // Hold   (9.5–10s): face fully formed, gentle breathing wobble only
      // At exactly 10.0s onComplete -> cinematic fade reveals the site beneath.
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: finish })
      tl.to(driver, { p: 0.6, duration: 6, ease: 'none',
          onUpdate: () => portrait.current && portrait.current.setProgress(driver.p) }, 0)
        .to(driver, { p: 1, duration: 3.5, ease: 'power1.inOut',
          onUpdate: () => portrait.current && portrait.current.setProgress(driver.p) }, 6)
        // HOLD 9.5–10.0s: face fully formed (breathing wobble only). This pad
        // pins the timeline to EXACTLY 10.0s so onComplete can never fire early.
        .to(driver, { p: 1, duration: 0.5 }, 9.5)
        .to('.intro-dot', { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 0.2)
        .to('.intro-dot', { opacity: 0, scale: 2.2, duration: 0.8, ease: 'power2.in' }, 1.4)
        .to('#particle-canvas', { opacity: 1, duration: 1.4 }, 0.8)
        .to(letters, { opacity: 1, x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0,
          duration: 1.8, stagger: { each: 0.1 } }, 1.2)
        .to(['.intro-sub', '.intro-top'], { opacity: 1, y: 0, duration: 1.0 }, 3.2)
    }, root)
    // Safety net only (11.5s): fires ONLY if the timeline itself failed.
    // GSAP timelines pause automatically when the tab is hidden and resume on
    // return, so no manual state handling is needed — just guard double-finish.
    const t = setTimeout(() => {
      if (!cancelled) finish()
    }, 11500)
    return () => {
      cancelled = true
      clearTimeout(t)
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="intro" ref={root} role="dialog" aria-label="Cinematic intro">
      <div className="intro-ambient" />
      <div className="intro-cloud cloud-1" aria-hidden="true" />
      <div className="intro-cloud cloud-2" aria-hidden="true" />
      <div className="intro-dot" />
      <div className="intro-stage">
        <div className="intro-top">
          <span>Krrish</span>
          <span>Portfolio — 2026</span>
        </div>
        <Portrait ref={portrait} imageSrc="/images/krrish.jpg" onStatus={setPhotoState} />
        {photoState === 'missing' && (
          <div className="photo-alert">
            Photo missing: save your picture as public/images/krrish.jpg, then refresh.
            Showing abstract particles till then — no fake face.
          </div>
        )}
        <div className="intro-word" aria-label="PORTFOLIO">
          {WORD.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        <div className="intro-sub">
          <span>
            BCA Student <em>&amp; Aspiring Developer</em>
          </span>
          <span>Scroll to explore</span>
        </div>
      </div>
      <div className="intro-hint">Cinematic intro</div>
      <label className="upload-btn" title="Optionally preview the effect with any photo">
        Use My Photo (PNG/JPG)
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          hidden
          onChange={(e) => {
            const f = e.target.files && e.target.files[0]
            if (f && portrait.current && portrait.current.loadFile) portrait.current.loadFile(f)
          }}
        />
      </label>
      <button className="skip-btn" onClick={finish}>
        Skip Intro
      </button>
    </div>
  )
}
