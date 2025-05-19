import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

export default function DashboardCard() {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const transactions = useSelector((state: RootState) => state.transaction.items);

  useEffect(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") {
        totalIncome += t.amount;
      } else if (t.type === "expense") {
        totalExpense += t.amount;
      }
    });

    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);
  }, [transactions]);

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
      <div>
        <p className="text-sm text-gray-500">Total Balance</p>
        <h2 className="text-3xl font-bold text-gray-800">${balance.toLocaleString()}</h2>
      </div>

      <div className="flex justify-between items-center mt-6">
        {/* Income */}
        <div className="flex items-center space-x-2">
          <ArrowDown className="text-green-500" size={20} />
          <div>
            <p className="text-xs text-gray-500">Income</p>
            <p className="text-sm font-semibold text-gray-700">
              ${income.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Expense */}
        <div className="flex items-center space-x-2">
          <ArrowUp className="text-red-500" size={20} />
          <div>
            <p className="text-xs text-gray-500">Expense</p>
            <p className="text-sm font-semibold text-gray-700">
              ${expense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
