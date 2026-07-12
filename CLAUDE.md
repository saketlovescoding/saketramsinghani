# saketramsinghani.life — Personal Website

## Project Overview
Static personal website for Saket Ramsinghani, hosted on GitHub Pages with custom domain `saketramsinghani.life`. The site has two modes — **Professional** (tech: work, projects, blog, notes, stats) and **Personal** (thoughts, meditation, growth, reading) — switched via a control in the nav.

## Tech Stack
- Pure HTML + CSS + vanilla JS (no frameworks, no build tools)
- three.js loaded as an ES module from jsdelivr via a `<script type="importmap">` in each page head (pinned version; update the pin in every page together)
- GitHub Pages for hosting; custom domain via CNAME

## File Structure
- `index.html` — Home; contains one hero block per mode (`.mode-block--professional` / `--personal`), CSS shows the active one
- `projects.html`, `blogs.html`, `notes.html`, `stats.html` — professional-mode pages
- `thoughts.html`, `reading.html` — personal-mode pages
- `styles.css` — single shared stylesheet
- `js/site.js` — shared theme toggle, mode switch, streak-image tinting, home stat strip
- `js/scene.js` — three.js background particle field (ES module)
- `CNAME` — GitHub Pages custom domain config

## Mode & Theme System
- `<html data-mode="professional|personal" data-theme="light|dark">`, both persisted in localStorage
- Base `:root` palette = professional light (site fully usable without JS); `[data-mode="personal"]` and `[data-theme="dark"]` layer overrides on top (4 combinations)
- Personal = warm beige/terracotta; Professional = cool graphite/ink; accent `#B85C38` (`#D17A4F` dark) shared everywhere
- Every page head has an inline FOUC-prevention snippet; mode-exclusive pages set `data-page-mode="..."` on that script tag, which forces + persists the mode
- `js/site.js` dispatches `sitemode` / `sitetheme` CustomEvents on `document`; `js/scene.js` listens to morph the particle field (personal = organic drift, professional = lattice) and retint

## three.js Scene Rules
- Atmosphere, not spectacle: low opacity, muted palette-derived colors (`--scene-dot`, `--scene-accent` CSS vars)
- `<body data-scene="full">` (home) vs `"ambient"` (subpages, sparser/fainter)
- Must keep: reduced-motion static frame, WebGL-absence bailout, pause on hidden tab, devicePixelRatio cap of 1.5

## Design System
- Max content width: 680px (`--max-width: 720px` incl. padding)
- Fonts: Cormorant Garamond (headings) + DM Sans (body) from Google Fonts
- Film-grain overlay on `body::after` — keep it
- Mobile breakpoint at 640px

## Conventions
- All pages share the same header (logo, mode switch, theme toggle, dual nav lists) and footer — edit all pages together when changing it
- Nav sets: professional `Work · Projects · Blog · Notes · Stats`, personal `About · Thoughts · Reading`; active link gets `class="active"` (index marks both Work and About)
- Semantic HTML (header, main, footer, nav); keep it minimal, no new dependencies
- External links use `target="_blank" rel="noopener"`
- Reusable components: `.card`/`.card-list` (projects, notes), `.entry-list` (blog/thoughts listings), `.book-list` (reading)

## Git / Deployment
- Remote: https://github.com/saketlovescoding/saketramsinghani.git
- Branch: main; deploys automatically via GitHub Pages on push
- Do NOT modify the CNAME file unless explicitly asked
