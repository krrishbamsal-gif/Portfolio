// ─────────────────────────────────────────────────────────────────────────────
// CENTRAL CONTENT FILE — edit ONLY the text between 'quotes', save, and the
// site updates automatically. No code changes needed.
//
// ACCURACY RULES (per Krrish's profile):
//  • email/phone are EDITABLE PLACEHOLDERS — add your real ones before publishing.
//  • Projects are labelled Concept vs Built honestly — BioGuard Nexus and the
//    AI Agent are CONCEPTS until you confirm they are built/tested.
//  • Skills are learning areas, not professional proficiency claims.
//  • Socials stay empty ([]) until you share real URLs — no links are invented.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  fullName: 'Krrish Bansal',
  name: 'Krrish',
  role: 'BCA Student & Aspiring Developer',
  headline: 'Learning by building — practical projects in web, AI, and IoT.',
  university: 'Amity University Rajasthan, Jaipur',
  email: 'krrishbamsal@gmail.com', // ← YOUR REAL EMAIL
  phone: '', // ← EDIT: e.g. '+91 98765 43210' — leave '' to hide the button
  photo: '/images/krrish.jpg', // save your photo as public/images/krrish.jpg
  photoAlt: 'Portrait photograph of Krrish Bansal',
  socials: [], // example: { label: 'LinkedIn', href: 'https://linkedin.com/in/yourname' }
}

export const ABOUT = {
  heading: 'About Me',
  name: 'Krrish Bansal',
  degree: 'Bachelor of Computer Applications (BCA) — Amity University Rajasthan, Jaipur',
  status: 'BCA student · Currently pursuing',
  focus: 'Programming · Web · AI · IoT',
  paragraphs: [
    "Hi, I'm Krrish — a BCA student at Amity University Rajasthan, Jaipur, with a strong interest in computer science, programming, software development, AI, and emerging technologies.",
    'I learn by building: programs in C, C++ and Python, responsive websites, DBMS and SQL practice, and concept projects around AI agents and IoT. Anything here that is still an idea is clearly labelled as a concept — no fake claims.',
  ],
}

export const SKILLS = [
  { group: 'Programming', items: ['C', 'C++', 'Python', 'JavaScript'] },
  { group: 'CS Foundations', items: ['Object-Oriented Programming', 'Data Structures & Algorithms', 'DBMS', 'SQL'] },
  { group: 'Web Development', items: ['HTML5', 'CSS3', 'Responsive Web Design', 'Hosting & Deployment'] },
  { group: 'AI, Data & IoT', items: ['AI Tools & AI Agents', 'IoT Concepts', 'Power BI (exploring)', 'Jupyter Notebook'] },
  { group: 'Tools & Platforms', items: ['Netlify (exploring)', 'Canva', 'Android Automation', 'Free / low-cost dev tools'] },
]

export const SKILLS_NOTE =
  'These are learning areas from BCA coursework and self-practice — not professional proficiency claims.'

// kind: 'Concept' = idea/research stage · 'Built' = actually made · 'Exploration' = practice work
export const PROJECTS = [
  {
    title: 'BioGuard Nexus',
    kind: 'Concept',
    tag: 'IoT Prototype Concept',
    desc: 'An IoT-based prototype concept for monitoring storage conditions — DS18B20 temperature probe, cooling/refrigeration components, alerts, and full project documentation. Currently at component research and design stage.',
    tech: ['IoT', 'DS18B20', 'Sensors'],
    liveUrl: '',
    repoUrl: '',
  },
  {
    title: 'AI Agent Project',
    kind: 'Concept',
    tag: 'AI Agent Concept',
    desc: 'An Android-friendly AI agent with a humorous desi-friend personality — voice and text interaction, automation, built around free and open-source tools with minimal paid API dependence.',
    tech: ['AI Agents', 'Automation', 'Android'],
    liveUrl: '',
    repoUrl: '',
  },
  {
    title: 'Personal Portfolio Website',
    kind: 'Built',
    tag: 'React • GSAP • Canvas',
    desc: 'This website — a cinematic portfolio with a particle-portrait intro built from a real photograph, chrome typography, dark theme, and smooth scroll animations.',
    tech: ['React', 'Vite', 'GSAP', 'Canvas'],
    liveUrl: '',
    repoUrl: '',
  },
  {
    title: 'Web Games & Creative Apps',
    kind: 'Exploration',
    tag: 'HTML • CSS • JavaScript',
    desc: 'Practice projects: browser games, wallpaper websites, interactive cards, and other creative web experiments built with plain HTML, CSS, and JavaScript.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: '',
    repoUrl: '',
  },
  {
    title: 'TECHWITHKRRISH-YT',
    kind: 'Concept',
    tag: 'Content Concept',
    desc: 'A YouTube channel concept around AI tools and technology videos for students — branding, scripts, and video ideas in progress.',
    tech: [],
    liveUrl: '',
    repoUrl: '',
  },
]

export const EDUCATION = [
  {
    degree: 'Bachelor of Computer Applications (BCA)',
    school: 'Amity University Rajasthan',
    dept: 'Jaipur',
    year: 'Currently pursuing',
    note: 'Coursework includes programming (C, C++, Python), DBMS and SQL, data structures & algorithms, web development, and introductory AI and IoT concepts.',
  },
]
/*SPLIT*/
