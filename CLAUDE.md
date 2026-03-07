# saketramsinghani.life — Personal Website

## Project Overview
Static personal website for Saket Ramsinghani, hosted on GitHub Pages with custom domain `saketramsinghani.life`.

## Tech Stack
- Pure HTML + CSS (no JavaScript frameworks, no build tools)
- GitHub Pages for hosting
- Custom domain via CNAME

## File Structure
- `index.html` — Home page (about section, social links)
- `blogs.html` — Blog listing page
- `projects.html` — Projects showcase page
- `styles.css` — Single shared stylesheet
- `CNAME` — GitHub Pages custom domain config

## Design System
- CSS custom properties defined in `:root` (styles.css)
- Color palette: warm beige background (#FAF7F2), brown accent (#8B7355)
- Max content width: 680px
- System font stack (no external fonts)
- Mobile-first responsive (breakpoint at 600px)

## Conventions
- All pages share the same nav header and footer structure
- Active nav link gets `class="active"`
- Use semantic HTML elements (header, main, footer, nav)
- Keep it minimal — no unnecessary dependencies or libraries
- All links to external sites use `target="_blank" rel="noopener"`

## Git / Deployment
- Remote: https://github.com/saketlovescoding/saketramsinghani.git
- Branch: main
- Deploys automatically via GitHub Pages on push to main
- Do NOT modify the CNAME file unless explicitly asked
