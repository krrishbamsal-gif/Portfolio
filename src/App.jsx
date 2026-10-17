import { useEffect, useState } from 'react'
import gsap from 'gsap'
import Intro from './components/CinematicIntro.jsx'
import './intro.css'
import { SITE, ABOUT, SKILLS, SKILLS_NOTE, PROJECTS, EDUCATION } from './data/content.js'

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    try {
      if (sessionStorage.getItem('krrish-intro-seen')) return false
      return true
    } catch {
      return true
    }
  })

  function handleDone() {
    try {
      sessionStorage.setItem('krrish-intro-seen', '1')
    } catch {
      /* sessionStorage may be blocked — intro simply replays next session */
    }
    setShowIntro(false)
  }

  // Lock page scrolling while the cinematic intro covers the screen.
  useEffect(() => {
    document.body.style.overflow = showIntro ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [showIntro])

  useEffect(() => {
    if (showIntro) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      document.querySelectorAll('.reveal').forEach((el) => {
        el.style.opacity = 1
        el.style.transform = 'none'
      })
      return
    }
    const ctx = gsap.context(() => {
      gsap.to('.reveal', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09 })
      gsap.from('.hero h1', { y: 60, opacity: 0, duration: 1.1, ease: 'power4.out' })
    })
    return () => ctx.revert()
  }, [showIntro])

  // Spotlight that follows the pointer across project cards.
  useEffect(() => {
    function onMove(e) {
      const el = e.target && e.target.closest ? e.target.closest('.proj') : null
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%')
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%')
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      {showIntro && <Intro onDone={handleDone} />}

      <nav className="nav" aria-label="Main navigation">
        <div className="wrap nav-inner">
          <div className="brand">
            KRRISH <small>©2026</small>
          </div>
          <div className="links">
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#education">Education</a>
            <a href="#contact">Contact</a>
          </div>
          <button
            className="replay-btn"
            onClick={() => {
              try {
                sessionStorage.removeItem('krrish-intro-seen')
              } catch {
                /* ignore */
              }
              setShowIntro(true)
            }}
          >
            Replay Intro
          </button>
        </div>
      </nav>

      <header className="hero wrap">
        <div className="eyebrow">Portfolio — 2026</div>
        <h1 className="chrome-text">{SITE.name}</h1>
        <h2>{SITE.role}</h2>
        <p className="lead">{SITE.headline}</p>
        <div className="cta-row">
          <a className="btn solid" href="#projects">
            View Projects
          </a>
          <a className="btn ghost" href={`mailto:${SITE.email}`}>
            Contact Me
          </a>
        </div>
        <div className="hero-meta">
          <span>{SITE.fullName} &bull; {SITE.university}</span>
        </div>
      </header>

      <section id="about" className="block">
        <div className="wrap">
          <div className="kicker reveal">01 — About</div>
          <h2 className="h-big reveal">{ABOUT.heading}</h2>
          <div className="about-grid">
            <div className="about-card reveal">
              <div className="about-photo">
                <img
                  src={SITE.photo}
                  alt={SITE.photoAlt}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <div className="about-facts">
                <div className="fact">
                  <span>Name</span>
                  <strong>{ABOUT.name}</strong>
                </div>
                <div className="fact">
                  <span>Education</span>
                  <strong>{ABOUT.degree}</strong>
                </div>
                <div className="fact">
                  <span>Status</span>
                  <strong>{ABOUT.status}</strong>
                </div>
                <div className="fact">
                  <span>Focus</span>
                  <strong>{ABOUT.focus}</strong>
                </div>
              </div>
            </div>
            <div className="about-text reveal">
              {ABOUT.paragraphs.map((p, i) => (
                <p className="prose" key={i}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="skills" className="block">
        <div className="wrap">
          <div className="kicker reveal">02 — Skills</div>
          <h2 className="h-big reveal">
            Skills &amp; <span className="chrome-text">Tools</span>
          </h2>
          <div className="skill-grid">
            {SKILLS.map((s) => (
              <div className="skill-card reveal" key={s.group}>
                <h3>{s.group}</h3>
                <div className="pill-row">
                  {s.items.map((x) => (
                    <span className="pill" key={x}>
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="skills-note reveal">{SKILLS_NOTE}</p>
        </div>
      </section>

      <section id="projects" className="block">
        <div className="wrap">
          <div className="kicker reveal">03 — Work</div>
          <h2 className="h-big reveal">
            Selected <span className="chrome-text">Projects</span>
          </h2>
          <div className="proj-grid">
            {PROJECTS.map((p) => {
              const links = [
                p.liveUrl ? { label: 'Live Demo', href: p.liveUrl } : null,
                p.repoUrl ? { label: 'Repository', href: p.repoUrl } : null,
              ].filter(Boolean)
              return (
                <div className="proj reveal" key={p.title}>
                  <div className="proj-top">
                    <div className="tag">{p.tag}</div>
                    <span className={`kind kind-${p.kind.toLowerCase()}`}>{p.kind}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  {p.tech && p.tech.length > 0 && (
                    <div className="pill-row">
                      {p.tech.map((t) => (
                        <span className="pill" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="proj-links">
                    {links.length > 0
                      ? links.map((l) => (
                          <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                            {l.label} →
                          </a>
                        ))
                      : <span className="link-soon">Link coming soon</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="education" className="block">
        <div className="wrap">
          <div className="kicker reveal">04 — Education</div>
          <h2 className="h-big reveal">Education</h2>
          {EDUCATION.map((e, i) => (
            <div className="edu reveal" key={i}>
              <h3>{e.degree}</h3>
              <p>
                {e.school}
                {e.dept ? ` · ${e.dept}` : ''} — {e.year}
              </p>
              {e.note && <p>{e.note}</p>}
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="block">
        <div className="wrap">
          <div className="kicker reveal">05 — Contact</div>
          <h2 className="h-big reveal">
            Let&rsquo;s <span className="chrome-text">Talk</span>
          </h2>
          <p className="prose reveal">
            Want to collaborate, ask a question, or just say hi? My inbox is open.
          </p>
          <div className="contact-box reveal">
            <a className="btn solid" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            {SITE.phone && (
              <a className="btn ghost" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
                {SITE.phone}
              </a>
            )}
          </div>
          {SITE.socials.length > 0 && (
            <div className="socials reveal">
              {SITE.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer>
        <div className="wrap">
          <span>© 2026 Krrish Bansal — Crafted with code &amp; light.</span>
          <a href="#about">Back to top ↑</a>
        </div>
      </footer>
    </>
  )
}
