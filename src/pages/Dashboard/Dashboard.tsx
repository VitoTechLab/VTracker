import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";
import { useAppDispatch } from "../../hook/redux_hook";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { TransactionList, TransactionWithId } from "../../database/queries";
import DashboardCard from "./DashboardCard";

// Dummy transactions (kalau redux kosong)
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

const Dashboard = () => {
  const transactions = useSelector((state: RootState) => state.transaction.items);

  const [mode, setMode] = useState<"daily" | "monthly">("daily");

  const groupedDailyData = [
    ...dummyTransactions,
  ...transactions.reduce<DailyData[]>((acc, transaction) => {
    const date = transaction.date;
    const existing = acc.find(item => item.date === date);

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

  const groupedMonthlyData = useMemo(() => {
    return transactions.reduce<MonthlyData[]>((acc, transaction) => {
      const [year, month] = transaction.date.split("-");
      const key = `${year}-${month}`;
      const existing = acc.find(item => item.month === key);

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

  const data = mode === "daily" ? groupedDailyData : groupedMonthlyData;
  const dataKey = mode === "daily" ? "date" : "month";

  const brushStartIndex = Math.max(0, data.length - 7);
  const brushEndIndex = data.length - 1;

  return (
    <div style={{ width: "100%", height: 350 }}>
      <DashboardCard />
      <div style={{ marginBottom: 10 }}>
        <label>
          Mode tampilan:{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value as "daily" | "monthly")}>
            <option value="daily">Harian</option>
            <option value="monthly">Bulanan</option>
          </select>
        </label>
      </div>

      <ResponsiveContainer width="80%" height="80%">
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

export default Dashboard;
