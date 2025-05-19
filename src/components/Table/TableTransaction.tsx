import { useEffect, useState } from "react";
import { FiEdit, FiInfo, FiTrash } from "react-icons/fi";
import type { TransactionWithId } from "../../database/queries";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../hook/redux_hook";
import type { RootState } from "../../redux/store";
import { deleteTransaction } from "../../redux/transaction_slice";
import { useTransactionCrud } from "../../hook/useTransactionCrud";
import { useCategoryCrud } from "../../hook/useCategoryCrud";

interface TableTransactionProps {
  type: string;
  openModal: (id?: number) => void;
}

const ITEMS_PER_PAGE = 5;

const TableTransaction: React.FC<TableTransactionProps> = ({ type, openModal }) => {
  const { getByIdCategory } = useCategoryCrud();
  const { removeTransaction } = useTransactionCrud();
  const dispatch = useAppDispatch();
  const getAllTransaction = useAppSelector((state: RootState) => state.transaction.items);

  const [transactions, setTransactions] = useState<TransactionWithId[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter transaksi sesuai tipe (income/expense)
  const filteredTransactions = transactions.filter(item => item.type === type);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = showAll
    ? filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : filteredTransactions.slice(0, ITEMS_PER_PAGE);

  useEffect(() => {
    setTransactions(getAllTransaction);
  }, [getAllTransaction]);

  const handleRemove = async (id: number) => {
    try {
      const success = await removeTransaction(id);
      if (success) {
        dispatch(deleteTransaction(id));
        toast.success("Transaction removed successfully");
      } else {
        toast.error("Failed to remove transaction");
      }
    } catch (error) {
      toast.error("An error occurred while removing transaction");
      console.error(error);
    }
  };

  const findCategoryById = (id: number) => {
    const cat = getByIdCategory(id);
    return cat ? `${cat.icon} ${cat.name}` : "Unknown";
  };

  // Style classes
  const headerBg = type === "income" ? "bg-green-600" : "bg-red-600";
  const headerText = "text-white";
  const borderColor = type === "income" ? "border-green-800" : "border-red-800";
  const buttonBg = type === "income" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";

  // Pagination handlers
  const goPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="flex gap-6 flex-wrap md:flex-nowrap border border-gray-200 rounded-lg shadow-sm">
      <div className="flex flex-col w-full bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center mb-4 mt-0.5">
          <h2 className={`text-2xl font-semibold ml-1 ${type === "income" ? "text-green-800" : "text-red-800"}`}>
            {type === "income" ? "Income" : "Expense"}
          </h2>
          <button
            className={`px-5 py-2.5 mr-4 ${buttonBg} text-white text-sm font-medium rounded transition-colors duration-200`}
            onClick={() => openModal()}
            aria-label={`Add ${type}`}
          >
            {type === "income" ? "+ Add Income" : "+ Add Expense"}
          </button>
        </div>

        <div className="rounded-sm max-h-60 overflow-auto bg-white shadow-inner border border-gray-200">
          <table className="table-auto min-w-full text-sm rounded-sm">
            <thead className="sticky top-0">
              <tr className={`${headerBg}`}>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${headerText} border-b ${borderColor}`}>
                  Name
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${headerText} border-b ${borderColor}`}>
                  Category
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${headerText} border-b ${borderColor}`}>
                  Amount
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${headerText} border-b ${borderColor} w-1/5`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 bg-white">
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500 italic">
                    No {type} transactions found.
                  </td>
                </tr>
              )}
              {paginatedTransactions.map(item => (
                <tr key={item.id} className="hover:bg-gray-100 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{findCategoryById(item.categoryId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-evenly text-sm text-gray-900">
                      <FiEdit
                        className="cursor-pointer hover:text-blue-600 transition-colors duration-150"
                        onClick={() => openModal(item.id)}
                        title="Edit"
                      />
                      <FiTrash
                        className="cursor-pointer hover:text-red-600 transition-colors duration-150"
                        onClick={() => handleRemove(item.id)}
                        title="Delete"
                      />
                      <FiInfo
                        className="cursor-pointer hover:text-gray-600 transition-colors duration-150"
                        title="Info"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & See More */}
        {filteredTransactions.length > ITEMS_PER_PAGE && (
          <div className="flex justify-between items-center mt-3">
            {!showAll ? (
              <button
                onClick={() => {
                  setShowAll(true);
                  setCurrentPage(1);
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                See More
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={goPrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border border-gray-300 ${
                    currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
                >
                  Prev
                </button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border border-gray-300 ${
                    currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => {
                    setShowAll(false);
                    setCurrentPage(1);
                  }}
                  className="ml-4 text-red-600 hover:underline font-medium"
                >
                  See Less
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableTransaction;
