import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTransactionCrud } from "../../hook/useTransactionCrud";
import { useCategoryCrud } from "../../hook/useCategoryCrud";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../hook/redux_hook";
import { addTransaction, editTransaction } from "../../redux/transaction_slice";

interface TransactionFormProps {
  type: string;
  editId?: number | null;
  onClosed: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type, editId, onClosed }) => {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: "",
    categoryId: 0,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState<string | null>(null);
  const { insertTransaction, updateTransaction, getByIdTransaction } = useTransactionCrud();
  const { getAllCategory } = useCategoryCrud();

  useEffect(() => {
    if (editId) {
      const fetchData = () => {
        try {
          const data = getByIdTransaction(Number(editId));
          if (data) {
            setFormData({
              name: data.name || "",
              categoryId: data.categoryId || 0,
              amount: data.amount || 0,
              date: data.date || new Date().toISOString().split('T')[0],
            });
          }
        } catch (err) {
          console.error("Failed to fetch transaction:", err);
        }
      };
      fetchData();
    }
  }, [editId, getByIdTransaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoryId" || name === "amount" ? Number(value) : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const { name, categoryId, amount, date } = formData;

  if (!name || !categoryId || !amount || !date) {
    setError("Please fill out all required fields.");
    return;
  }

  try {
    if (editId) {
      const success = await updateTransaction({ ...formData, type, id: Number(editId) });
      if (success) {
        dispatch(editTransaction({
          ...formData, type,
          id: editId
        }))
        toast.success("Transaction updated successfully!");
      } else {
        toast.error("Failed to update transaction.");
      }
    } else {
      const insertId = insertTransaction({ ...formData, type });
      console.log(insertId);
      
      if (insertId) {
        dispatch(addTransaction({
          ...formData, type,
          id: Number(insertId)
        }));
        toast.success("Transaction added successfully!");
      } else {
        toast.error("Failed to add transaction.");
      }
    }
    onClosed();
  } catch (err) {
    setError("Failed to save transaction. Please try again.");
    toast.error("Something went wrong!");
    console.error(err);
  }
};

  const isFormValid = formData.name && formData.categoryId && formData.amount && formData.date;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      aria-labelledby="transaction-form-title"
    >
      <h2 id="transaction-form-title" className="text-2xl mb-4 font-semibold text-gray-800">
        {editId ? "Edit" : "Add"} {type === "income" ? "Income" : "Expense"}
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-required="true"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-required="true"
          >
            <option value={0} disabled>
              -- Select Category --
            </option>
            <option value={1}>hello</option> 
            {getAllCategory?.()
              ?.filter(cat => cat.name && cat.type === type) 
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount || ""}
              onChange={handleChange}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-required="true"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} // Can't select future dates
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-required="true"
          />
        </div>
      </div>

      <motion.button
        type="submit"
        className={`w-full mt-6 py-2 px-4 rounded-lg font-medium ${isFormValid 
          ? "bg-blue-600 text-white hover:bg-blue-700" 
          : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        whileHover={isFormValid ? { scale: 1.02 } : {}}
        whileTap={isFormValid ? { scale: 0.98 } : {}}
        disabled={!isFormValid}
        aria-disabled={!isFormValid}
      >
        {editId ? "Update" : "Add"} {type === "income" ? "Income" : "Expense"}
      </motion.button>
    </motion.form>
  );
};

export default TransactionForm;