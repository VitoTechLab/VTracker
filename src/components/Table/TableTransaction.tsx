import { useEffect, useState } from "react";
import { FiEdit, FiInfo, FiTrash } from "react-icons/fi";
import type { TransactionWithId } from "../../database/queries";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../hook/redux_hook";
import type { RootState } from "../../redux/store";
import { deleteCategory } from "../../redux/category_slice";
import { useTransactionCrud } from "../../hook/useTransactionCrud";
import { useCategoryCrud } from "../../hook/useCategoryCrud";

interface TableTransactionProps {
  type: string;
  openModal: (id?: number) => void;
}

const TableTransaction: React.FC<TableTransactionProps> = ({ type, openModal }) => {
  const { getByIdCategory } = useCategoryCrud();
  const { removeTransaction } = useTransactionCrud();
  const dispatch = useAppDispatch();
  const getAllTransaction = useAppSelector((state: RootState) => state.transaction.items);
  const [transactions, setTransactions] = useState<TransactionWithId[] | []>([]);

  useEffect(() => {
    setTransactions(getAllTransaction);
  }, [getAllTransaction]);
  
  const handleRemove = async (id: number) => {
    try {
      const success = await removeTransaction(id);
      if (success) {
        dispatch(deleteCategory(Number(id)))
        toast.success("Transaction removed successfully");
        setTransactions(getAllTransaction); 
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
  console.log(cat?.name);
  
  console.log(cat?.icon);
  
  return cat ? `${cat.icon} ${cat.name}` : 'Unknown';
};

  const headerBg = type === "income" ? "bg-green-700" : "bg-red-700";
  const headerText = "text-white";
  const borderColor = type === "income" ? "border-green-900" : "border-red-900";
  const buttonBg = type === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";

  return (
    <div className="flex gap-6 flex-wrap md:flex-nowrap border border-gray-200 rounded-lg">
      <div className="flex flex-col w-full bg-gray-50 shadow-md p-4">
        <div className="flex justify-between items-center mb-4 mt-0.5">
          <h2 className={`text-2xl font-semibold ml-1 ${type === "income" ? "text-green-800" : "text-red-800"}`}>
            {type === "income" ? "Income" : "Expense"}
          </h2>
          <button
            className={`px-5 py-2.5 mr-4 ${buttonBg} text-white text-sm font-medium rounded transition-colors duration-200`}
            onClick={() => openModal()}
          >
            {type === "income" ? "+ Add Income" : "+ Add Expense"}
          </button>
        </div>

        <div className="rounded-sm h-48 max-h-48 overflow-auto bg-white">
          <table className="table-auto min-w-full text-sm rounded-sm shadow-md">
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
              {transactions
                .filter(item => item.type === type)
                .map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {findCategoryById(Number(item.id))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.amount}</div>
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
                        <FiInfo className="cursor-pointer hover:text-gray-600 transition-colors duration-150" title="Info" />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableTransaction;
