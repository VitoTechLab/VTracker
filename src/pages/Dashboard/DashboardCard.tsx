import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function DashboardCard() {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  // Contoh: Load data saat aplikasi dimulai
  useEffect(() => {
    // Ganti logic ini dengan fetch dari API/localStorage nanti
    const fetchedIncome = 8000;
    const fetchedExpense = 3500;
    setIncome(fetchedIncome);
    setExpense(fetchedExpense);
    setBalance(fetchedIncome - fetchedExpense);
  }, []);

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
