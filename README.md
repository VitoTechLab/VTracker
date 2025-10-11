# VTracker - Personal Finance Dashboard

VTracker is a modern personal finance dashboard that helps you understand where your money goes. Track income and expenses, review category insights, and monitor savings momentum in a single, responsive interface.

## Features

- Cash-flow performance chart comparing income, expense, and balance trends.
- Category insights with contribution percentages for income and expense groups.
- Momentum analytics covering net cashflow, cumulative balance, and savings rate.
- Quick summary KPIs for balances, totals, and savings performance.
- Offline-first storage powered by `sql.js`, so data stays on your device.
- Light and dark theme toggle with adaptive styling.

## Tech Stack

- React 19 + TypeScript
- Vite build tooling
- Redux Toolkit for state management
- Tailwind CSS utilities (via `@tailwindcss/vite`)
- Recharts for data visualization
- sql.js for client-side persistence

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the development server
   ```bash
   npm run dev
   ```
   Open the URL shown in the terminal (defaults to `http://localhost:5173`).

3. Create a production build
   ```bash
   npm run build
   npm run preview
   ```

## Project Structure

```
.
|-- index.html                 # App entry with SEO/meta tags
|-- public/                    # Static assets (logos, OG images, wasm)
|-- src/
|   |-- components/            # Reusable UI building blocks
|   |-- pages/                 # Routed page layouts (Dashboard, Transactions, etc.)
|   |-- redux/                 # Redux slices and store
|   |-- database/              # sql.js setup and table creation helpers
|   `-- hook/                  # Custom React hooks
`-- vite.config.ts             # Vite configuration
```

## Environment Variables

Duplicate `.env.example` as `.env` (if provided) or define environment variables directly. The app runs with default values for local development.

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes and run `npm run lint`.
3. Open a pull request that describes the update and includes screenshots when relevant.

## License

This project is licensed under the [MIT License](LICENSE).
