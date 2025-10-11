import type { SummaryMetric } from "../types";

type StatisticSummaryGridProps = {
  metrics: SummaryMetric[];
};

const StatisticSummaryGrid = ({ metrics }: StatisticSummaryGridProps) => (
  <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <article
          key={metric.id}
          className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 transition-colors duration-300 dark:bg-[var(--surface-2)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{metric.label}</p>
          <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]" title={metric.title}>
            {metric.value}
          </p>
          {metric.trend && <p className="mt-1 text-xs text-[var(--text-muted)]">{metric.trend}</p>}
        </article>
      ))}
    </div>
  </section>
);

export default StatisticSummaryGrid;
