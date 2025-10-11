import type { TimeframeOption, TimeframeOptionConfig } from "../types";

type StatisticHeaderProps = {
  timeframe: TimeframeOption;
  options: TimeframeOptionConfig[];
  onTimeframeChange: (option: TimeframeOption) => void;
};

const StatisticHeader = ({ timeframe, options, onTimeframeChange }: StatisticHeaderProps) => (
  <header className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Performance</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Statistics</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Analyse your financial performance, understand category trends, and monitor savings progress.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] p-1 dark:bg-[var(--surface-2)]">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onTimeframeChange(option.id)}
            className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              timeframe === option.id
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            aria-pressed={timeframe === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  </header>
);

export default StatisticHeader;
