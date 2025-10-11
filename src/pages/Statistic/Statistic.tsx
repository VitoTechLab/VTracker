import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { CategoryWithId } from "../../database/queries";
import StatisticHeader from "./components/StatisticHeader";
import StatisticSummaryGrid from "./components/StatisticSummaryGrid";
import StatisticCashflowChart from "./components/StatisticCashflowChart";
import StatisticCategoryBreakdown from "./components/StatisticCategoryBreakdown";
import StatisticNetMomentumChart from "./components/StatisticNetMomentumChart";
import type {
  CategoryInsight,
  MomentumPoint,
  MonthlySeriesPoint,
  SummaryMetric,
  TimeframeOption,
  TimeframeOptionConfig,
} from "./types";
import { formatCurrency, formatFullCurrency } from "./utils/format";

const timeframeOptions: TimeframeOptionConfig[] = [
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
  { id: "365", label: "12 months" },
  { id: "all", label: "All time" },
];

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const Statistic = () => {
  const transactions = useSelector((state: RootState) => state.transaction.items);
  const categories = useSelector((state: RootState) => state.category.items);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("90");

  const filteredTransactions = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    const now = Date.now();
    const windowDays = timeframe === "all" ? Number.POSITIVE_INFINITY : Number(timeframe);

    return transactions.filter((transaction) => {
      const timestamp = new Date(transaction.date).getTime();
      if (Number.isNaN(timestamp)) {
        return false;
      }
      if (!Number.isFinite(windowDays)) {
        return true;
      }
      return now - timestamp <= windowDays * MS_IN_DAY;
    });
  }, [transactions, timeframe]);

  const categoryLookup = useMemo(() => {
    const map = new Map<number, CategoryWithId>();
    categories.forEach((category) => map.set(category.id, category));
    return map;
  }, [categories]);

  const summaryMetrics = useMemo<SummaryMetric[]>(() => {
    if (filteredTransactions.length === 0) {
      return [
        {
          id: "empty",
          label: "No activity",
          value: "-",
          title: "Add income and expense records to unlock insights",
        },
      ];
    }

    const income = filteredTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const expense = filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const net = income - expense;
    const average =
      filteredTransactions.length === 0
        ? 0
        : filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0) /
          filteredTransactions.length;
    const largest = filteredTransactions.reduce(
      (acc, transaction) => (transaction.amount > acc ? transaction.amount : acc),
      0,
    );
    const savingsRate = income === 0 ? 0 : Math.max(-100, ((income - expense) / income) * 100);

    return [
      {
        id: "income",
        label: "Total income",
        value: formatCurrency(income),
        title: formatFullCurrency(income),
        trend: `${filteredTransactions.filter((item) => item.type === "income").length} records`,
      },
      {
        id: "expense",
        label: "Total expense",
        value: formatCurrency(expense),
        title: formatFullCurrency(expense),
        trend: `${filteredTransactions.filter((item) => item.type === "expense").length} records`,
      },
      {
        id: "net",
        label: "Net balance",
        value: formatCurrency(net),
        title: formatFullCurrency(net),
        trend: net >= 0 ? "Positive net cashflow" : "Negative net cashflow",
      },
      {
        id: "average",
        label: "Average ticket",
        value: formatCurrency(average, average > 100 ? 0 : 2),
        title: formatFullCurrency(average, 2),
        trend: "Per transaction",
      },
      {
        id: "largest",
        label: "Largest transaction",
        value: formatCurrency(largest),
        title: formatFullCurrency(largest),
      },
      {
        id: "savingsRate",
        label: "Savings rate",
        value: `${savingsRate.toFixed(1)}%`,
        title: `${savingsRate.toFixed(1)}% of income retained`,
      },
    ];
  }, [filteredTransactions]);

  const monthlySeries = useMemo<MonthlySeriesPoint[]>(() => {
    if (filteredTransactions.length === 0) {
      return [];
    }

    const map = new Map<string, { income: number; expense: number }>();

    filteredTransactions.forEach((transaction) => {
      const parsed = new Date(transaction.date);
      if (Number.isNaN(parsed.getTime())) {
        return;
      }
      const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
      const bucket = map.get(key) ?? { income: 0, expense: 0 };
      if (transaction.type === "income") {
        bucket.income += transaction.amount;
      } else {
        bucket.expense += transaction.amount;
      }
      map.set(key, bucket);
    });

    return Array.from(map.entries())
      .sort((a, b) => new Date(`${a[0]}-01`).getTime() - new Date(`${b[0]}-01`).getTime())
      .map(([key, value]) => {
        const [year, month] = key.split("-").map(Number);
        const label = new Date(year, (month ?? 1) - 1, 1).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        return {
          key,
          label,
          income: Number(value.income.toFixed(2)),
          expense: Number(value.expense.toFixed(2)),
        };
      });
  }, [filteredTransactions]);

  const momentumSeries = useMemo<MomentumPoint[]>(() => {
    if (monthlySeries.length === 0) {
      return [];
    }

    let cumulative = 0;

    return monthlySeries.map((point) => {
      const net = point.income - point.expense;
      cumulative += net;
      const savingsRate = point.income === 0 ? 0 : ((point.income - point.expense) / point.income) * 100;

      return {
        label: point.label,
        net,
        cumulativeNet: cumulative,
        savingsRate,
      };
    });
  }, [monthlySeries]);

  const categoryBreakdown = useMemo<{
    income: CategoryInsight[];
    expense: CategoryInsight[];
  }>(() => {
    const incomeMap = new Map<number, number>();
    const expenseMap = new Map<number, number>();

    filteredTransactions.forEach((transaction) => {
      const targetMap = transaction.type === "income" ? incomeMap : expenseMap;
      const current = targetMap.get(transaction.categoryId) ?? 0;
      targetMap.set(transaction.categoryId, current + transaction.amount);
    });

    const createList = (map: Map<number, number>) => {
      const total = Array.from(map.values()).reduce((sum, amount) => sum + amount, 0);
      return Array.from(map.entries())
        .map(([categoryId, totalAmount]) => {
          const category = categoryLookup.get(categoryId);
          return {
            id: categoryId,
            name: category?.name ?? "Uncategorised",
            icon: category?.icon ?? "-",
            total: totalAmount,
            percentage: total === 0 ? 0 : (totalAmount / total) * 100,
          };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);
    };

    return {
      income: createList(incomeMap),
      expense: createList(expenseMap),
    };
  }, [filteredTransactions, categoryLookup]);

  return (
    <section className="space-y-6 pb-24 lg:pb-6 [padding-bottom:calc(6rem+env(safe-area-inset-bottom))] lg:[padding-bottom:1.5rem]">
      <StatisticHeader timeframe={timeframe} options={timeframeOptions} onTimeframeChange={setTimeframe} />
      <StatisticSummaryGrid metrics={summaryMetrics} />
      <StatisticNetMomentumChart data={momentumSeries} />
      <StatisticCashflowChart data={monthlySeries} />
      <StatisticCategoryBreakdown income={categoryBreakdown.income} expense={categoryBreakdown.expense} />
    </section>
  );
};

export default Statistic;
