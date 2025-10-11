export const formatCurrency = (value: number, maximumFractionDigits = 0) => {
  const absolute = Math.abs(value);
  const useCompact = absolute >= 1_000_000_000;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: useCompact ? "compact" : "standard",
    maximumFractionDigits: useCompact ? 2 : maximumFractionDigits,
  }).format(value);
};

export const formatFullCurrency = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);

export const formatPercentage = (value: number, maximumFractionDigits = 1) =>
  `${value.toFixed(maximumFractionDigits)}%`;
