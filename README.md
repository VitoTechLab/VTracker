
# VTracker — Personal Finance Dashboard

VTracker is a modern, local-first personal finance dashboard that helps you understand where your money goes. Add and categorize transactions, view trends and KPIs, and explore visual analytics — all in the browser (no backend required).

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Data & Privacy](#data--privacy)
- [Development Tips](#development-tips)
- [Contributing](#contributing)
- [License](#license)
- [Roadmap](#roadmap)
- [FAQ](#faq)

---

## Features

- Cash-flow performance chart (income, expense, balance)
- Category breakdown and contribution percentages
- Momentum analytics (net cashflow, cumulative balance)
- Quick KPIs: balance, monthly totals, recent activity
- Offline-first persistence using `sql.js` + IndexedDB
- Theme toggle (light / dark)
- CRUD for transactions and categories (emoji support)
- Responsive UI with smooth micro-interactions

---

## Tech Stack

- React 19 + TypeScript
- Vite for tooling (dev & build)
- Redux Toolkit for state management
- Tailwind CSS (via `@tailwindcss/vite`)
- Recharts for charts
- sql.js + IndexedDB for client-side persistence
- Framer Motion for animations

---

## Project Structure

Top-level notable files & folders:

- `index.html` — app entry
- `public/` — static assets (including wasm for sql.js)
- `src/`
   - `assets/` — images, styles
   - `components/` — shared UI components
   - `constants/` — constant values (e.g., emoji options)
   - `context/` — React context providers (e.g., ThemeProvider)
   - `database/` — sql.js / IndexedDB helpers and queries
   - `hook/` — custom hooks (CRUD, modal, persistence helpers)
   - `pages/` — app pages (Dashboard, Transaction, Category, Statistic)
   - `redux/` — slices and store configuration
   - `utils/` — utility helpers
   - `App.tsx`, `main.tsx`, `vite-env.d.ts`

This structure follows the project layout found in the repository.

---

## Getting Started

Prerequisites: Node.js (recommended >=18) and npm.

1. Clone and install

```bash
git clone https://github.com/VitoTechLab/VTracker.git
cd VTracker
npm install
```

2. Start development server

```bash
npm run dev
```

Open the URL printed by Vite (default: `http://localhost:5173`).

---

## Available Scripts

- `npm run dev` — start the Vite dev server (HMR)
- `npm run build` — compile TypeScript (`tsc -b`) then build with Vite
- `npm run preview` — preview the production build from `dist`
- `npm run lint` — run ESLint
- `npm run deploy` — publish `dist` to GitHub Pages (uses `gh-pages`)

---

## Data & Privacy

- All user data is stored locally in the browser (sql.js persisted to IndexedDB).
- Clearing site data / browser storage will remove app data.
- Recommended to use a modern browser (Chrome, Edge, Firefox) for best compatibility.

---

## Development Tips

- Use Node.js version compatible with the project's `devDependencies` (see `package.json`).
- Run `npm run lint` before committing.
- Use Vite HMR for quick UI iteration.

---

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make changes, run linters
4. Push and open a Pull Request with a clear description and screenshots if applicable

---

## License

Licensed under the MIT `License`. See LICENSE
 for details.

---

## Roadmap

- Add export/import (CSV/JSON)
- Enable cloud sync (opt-in)
- Add tests and CI

---

## FAQ

- Q: Where is my data stored?
  - A: Locally in the browser via sql.js and IndexedDB.

- Q: Can I backup or export my data?
   - A: Export/import isn't implemented by default; it's on the roadmap. You can manually export IndexedDB or add a feature PR.

