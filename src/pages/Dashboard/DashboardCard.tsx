import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import IconWrapper from "../../components/Icon/IconWrapper";

export default function DashboardCard() {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const transactions = useSelector(
    (state: RootState) => state.transaction.items
  );

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
    <section
      aria-label="Financial Summary"
      className="w-full bg-blue-500 border border-white/20 rounded-2xl p-6 shadow-xl text-white"
    >
      {/* Total Balance */}
      <div>
        <p className="text-xl font-semibold text-white/90">Total Balance</p>
        <h2 className="text-4xl font-bold mt-1">
          ${balance.toLocaleString()}
        </h2>
      </div>

      {/* Income & Expense */}
      <div className="flex justify-between items-center mt-8">
        {/* Income */}
        <div className="flex items-center space-x-3">
          <IconWrapper>
            <ArrowDown className="text-green-500" size={26} />
          </IconWrapper>
          <div>
            <p className="text-sm font-medium text-white/80">Income</p>
            <p className="text-lg font-semibold text-white">
              ${income.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Expense */}
        <div className="flex items-center space-x-3">
          <IconWrapper>
            <ArrowUp className="text-red-400" size={26} />
          </IconWrapper>
          <div>
            <p className="text-sm font-medium text-white/80">Expense</p>
            <p className="text-lg font-semibold text-white">
              ${expense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
