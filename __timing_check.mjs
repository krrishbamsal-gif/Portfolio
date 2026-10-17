import { gsap } from 'gsap'

// Replicates the EXACT master-timeline structure from CinematicIntro.jsx
const driver = { p: 0 }
const tl = gsap.timeline()
tl.to(driver, { p: 0.6, duration: 6, ease: 'none' }, 0)
  .to(driver, { p: 1, duration: 3.5, ease: 'power1.inOut' }, 6)
  .to(driver, { p: 1, duration: 0.5 }, 9.5)

// Identical to revealE() in ParticlePortrait.jsx
const revealE = (p) => (p <= 0.6 ? 0 : 1 - Math.pow(1 - (p - 0.6) / 0.4, 3))

const sample = (t) => {
  tl.time(t)
  const p = driver.p
  return 't=' + t.toFixed(2) + 's p=' + p.toFixed(4) + ' e=' + revealE(p).toFixed(4)
}

console.log('TL_DURATION=' + tl.duration())
for (const t of [0, 3, 5.99, 6, 7.1, 8, 9.5, 10]) console.log(sample(t))
