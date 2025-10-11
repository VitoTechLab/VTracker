export type TimeframeOption = "30" | "90" | "365" | "all";

export type TimeframeOptionConfig = {
  id: TimeframeOption;
  label: string;
};

export type SummaryMetric = {
  id: string;
  label: string;
  value: string;
  title: string;
  trend?: string;
};

export type CategoryInsight = {
  id: number;
  name: string;
  icon: string;
  total: number;
  percentage: number;
};

export type MonthlySeriesPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
};

export type MomentumPoint = {
  label: string;
  net: number;
  cumulativeNet: number;
  savingsRate: number;
};
