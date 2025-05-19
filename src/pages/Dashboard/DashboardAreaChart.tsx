import { useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Brush,
} from "recharts";
import type { RootState } from "../../redux/store";
import { useMemo, useState } from "react";

const dummyTransactions = [
  { date: "2025-05-01", income: 3000, expense: 700 },
  { date: "2025-05-02", income: 400, expense: 0 },
  { date: "2025-05-03", income: 0, expense: 50 },
  { date: "2025-05-04", income: 1200, expense: 300 },
  { date: "2025-05-05", income: 900, expense: 100 },
  { date: "2025-05-06", income: 700, expense: 200 },
  { date: "2025-05-07", income: 1100, expense: 500 },
  { date: "2025-05-08", income: 600, expense: 0 },
  { date: "2025-05-09", income: 0, expense: 400 },
  { date: "2025-05-10", income: 800, expense: 300 },
  { date: "2025-05-11", income: 500, expense: 200 },
  { date: "2025-05-12", income: 950, expense: 150 },
  { date: "2025-05-13", income: 1000, expense: 0 },
  { date: "2025-05-14", income: 0, expense: 250 },
  { date: "2025-05-15", income: 600, expense: 100 },
  { date: "2025-05-16", income: 1200, expense: 300 },
  { date: "2025-05-17", income: 700, expense: 200 },
  { date: "2025-05-18", income: 900, expense: 400 },
  { date: "2025-05-19", income: 1100, expense: 350 },
  { date: "2025-05-20", income: 1300, expense: 500 },
];

type DailyData = { date: string; income: number; expense: number };
type MonthlyData = { month: string; income: number; expense: number };

const DashboardAreaChart = () => {
  const transactions = useSelector(
    (state: RootState) => state.transaction.items
  );

  const [mode, setMode] = useState<"daily" | "monthly">("daily");

  // Combine dummy and actual transactions grouped by day
  const groupedDailyData: DailyData[] = [
    ...dummyTransactions,
    ...transactions.reduce<DailyData[]>((acc, transaction) => {
      const date = transaction.date;
      const existing = acc.find((item) => item.date === date);

      if (existing) {
        if (transaction.type === "income") existing.income += transaction.amount;
        else existing.expense += transaction.amount;
      } else {
        acc.push({
          date,
          income: transaction.type === "income" ? transaction.amount : 0,
          expense: transaction.type === "expense" ? transaction.amount : 0,
        });
      }

      return acc;
    }, []),
  ];

  // Group transactions by month using useMemo for performance
  const groupedMonthlyData = useMemo(() => {
    return transactions.reduce<MonthlyData[]>((acc, transaction) => {
      const [year, month] = transaction.date.split("-");
      const key = `${year}-${month}`;
      const existing = acc.find((item) => item.month === key);

      if (existing) {
        if (transaction.type === "income") existing.income += transaction.amount;
        else existing.expense += transaction.amount;
      } else {
        acc.push({
          month: key,
          income: transaction.type === "income" ? transaction.amount : 0,
          expense: transaction.type === "expense" ? transaction.amount : 0,
        });
      }

      return acc;
    }, []);
  }, [transactions]);

  // Select data and data key based on mode
  const data = mode === "daily" ? groupedDailyData : groupedMonthlyData;
  const dataKey = mode === "daily" ? "date" : "month";

  // Define brush indices to show last 7 data points by default
  const brushStartIndex = Math.max(0, data.length - 7);
  const brushEndIndex = data.length - 1;

  return (
    // Wrapper card with margin top and padding
    <div className="max-w-full bg-white rounded-xl shadow-md p-6 mt-6">
      {/* Dropdown selector aligned right */}
      <div className="mb-4 flex justify-end">
        <select
          aria-label="Select chart display mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as "daily" | "monthly")}
          className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Responsive area chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={dataKey} />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#4caf50"
            fill="#a5d6a7"
            name="Income"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#f44336"
            fill="#ef9a9a"
            name="Expense"
          />
          {data.length > 7 && (
            <Brush
              dataKey={dataKey}
              height={30}
              stroke="#8884d8"
              startIndex={brushStartIndex}
              endIndex={brushEndIndex}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardAreaChart;
