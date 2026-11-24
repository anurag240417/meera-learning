# Meera Verma Learning Studio — landing page

A single-page, responsive React marketing site for Meera Verma Learning Studio, built from the
supplied desktop (1440px) and mobile (390px) design references. The page's main action is the
"Request a call" registration form, which is wired to the supplied local registration API.

- React 18 + Vite 5, no UI framework
- Semantic HTML5 (`header`, `nav`, `main`, `section`, `article`, `footer`), one `h1`, ordered headings
- CSS Modules per component; only design tokens and element defaults are global (`src/styles/base.css`)
- Airbnb JavaScript/React style, enforced with `eslint-config-airbnb` (`npm run lint`)
- Targets WCAG 2.1 AA (checked by hand and with `eslint-plugin-jsx-a11y`; not a formal audit)

## Requirements

Node.js 20 or newer, and npm.

## Setup and run

```sh
npm install
cp .env.example .env        # optional in development; see "API base URL" below
```

Run the frontend and the local API in two terminals:

```sh
npm run dev     # http://127.0.0.1:5173
npm run api     # http://127.0.0.1:8787  (GET /api/health returns 200)
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the production build at http://127.0.0.1:4173 |
| `npm run lint` | ESLint with the Airbnb config (React, hooks, jsx-a11y, import rules) |
| `npm run check:api` | Contract tests for the supplied API's validation |

Open the site on port **5173** when testing registration: the local API only accepts requests
from `http://localhost:5173` and `http://127.0.0.1:5173` (CORS allow-list in `api/server.mjs`).

## Component structure

```
src/
├── main.jsx                      React root + global tokens import
├── App.jsx / App.module.css      Page shell, skip link, program-preselect state
├── styles/base.css               Design tokens (colours, spacing 8–64px), element resets, focus ring
├── data/content.js               All approved copy, image paths and alt text in one place
├── lib/
│   ├── validation.js             Client validation mirroring api/server.mjs rules
│   └── registrationApi.js        POST /api/register with timeout, env-based API base URL
└── components/
    ├── Container/                Max-width 1280px wrapper with responsive gutters
    ├── Button/                   Link-or-button primitive (≥44px targets)
    ├── SectionHeader/            Section h2 + intro text
    ├── Header/                   Logo, nav and accessible mobile menu
    ├── Hero/                     Eyebrow, h1, intro, primary CTA, hero artwork
    ├── Benefits/                 "Why us": numbered benefit cards (ordered list)
    ├── Programs/                 Programs grid + reusable ProgramCard
    ├── RegistrationForm/         Controlled form, validation, consent, API states
    ├── Faq/                      Questions and answers (description list)
    └── Footer/                   Studio name, tagline, copyright
```

Each component folder holds `Component.jsx` and `Component.module.css`. Copy lives in
`src/data/content.js`, so wording changes do not touch component code.

### Behaviour notes

- **Navigation:** header links go to Programs, Why us, FAQs and the registration form
  ("Reserve a call"). Below 768px the links collapse behind a **Menu** button that toggles
  `aria-expanded`, works with Enter/Space, closes on Escape (focus returns to the button), closes
  after a link is chosen, and closes when the viewport grows to desktop width.
- **Skip link:** the first Tab stop is "Skip to main content".
- **View program:** each program card's link scrolls to the form and preselects that program
  without clearing anything the visitor already typed. Links carry the program name for screen readers.
- **Responsive layout:** mobile-first CSS with breakpoints at 640, 768, 1024 and 1200px.
  Checked at 320, 390, 768, 1200 and 1440px with no horizontal overflow (see the test log).
- **Images:** the supplied WebP artwork with explicit `width`/`height` (no layout shift); the hero
  image is preloaded and the program images are lazy-loaded.

## Registration form

Fields: full name (2–80 characters), email (valid, ≤254 characters), program interest
(`foundations`, `focus` or `career`), and consent (unchecked by default, must be ticked).

- Nothing is sent until every field passes validation. Errors appear under each field, the field is
  marked `aria-invalid` and linked with `aria-describedby`, and focus moves to the first invalid field.
- While sending, the button shows a spinner with "Sending request…" and is disabled to prevent double submits.
- Success (`201`): a `role="status"` message with the API's reference number; the form is cleared.
- API errors (`400`, `429`, other): a `role="alert"` message. The `400` message from the API is shown.
- Network failure or 10-second timeout: a `role="alert"` message. **The entered data is kept.**
- The request body is JSON: `{ fullName, email, programInterest, consent }` (name and email trimmed).

### API base URL

`src/lib/registrationApi.js` reads `VITE_API_BASE_URL` at build time:

| Situation | Behaviour |
| --- | --- |
| `npm run dev`, variable unset | Uses `http://localhost:8787` (the supplied local API) |
| Any build with `VITE_API_BASE_URL` set | Posts to `${VITE_API_BASE_URL}/api/register` |
| Production build, variable unset | Validates the form, then shows "Online registration is not connected on this preview site, so nothing was sent." No request is made. |

## Deployment (Vercel or Netlify)

Build command `npm run build`, output directory `dist`, Node 20+.

- **Vercel:** import the GitHub repository; the Vite preset fills in the settings.
- **Netlify:** "Import from Git"; build command `npm run build`, publish directory `dist`.

**Registration on the live demo.** The supplied API is a local development service: it binds to
`127.0.0.1` and only allows the two localhost origins. A static site on Vercel or Netlify cannot post
to a visitor's own `localhost`. So the public deployment is built **without** `VITE_API_BASE_URL`:
the live form validates fully and then states plainly that online registration is not connected,
and it sends nothing. Full submission was tested locally against the supplied API (test log rows 11–12).

To enable live submissions later, host a registration endpoint over HTTPS that follows the same
contract (`POST /api/register`, `201/400/429` responses), allow the site's origin in its CORS
configuration, add production controls (rate limiting, spam protection, data-retention policy), then
set `VITE_API_BASE_URL=https://your-api.example.com` in the hosting provider's environment variables
and redeploy.

## Testing

Results are recorded in `docs/testing/ACCEPTANCE_TEST_LOG.csv`, with screenshots in
`docs/testing/screenshots/`. Checks were run with real Chrome and real Firefox (headless, driven by
puppeteer-core) against the dev server + local API and against the production preview, plus manual
checks in a Chromium browser pane.

## Project references

- The client's content/design specification and reference mockups are confidential and are not
  stored in this public repository. They are provided to reviewers separately.
- `api/`: the supplied local registration API, kept unchanged
