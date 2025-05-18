import { FiEdit, FiTrash } from "react-icons/fi";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hook/redux_hook";
import { deleteCategory } from "../../redux/category_slice";
import type { RootState } from "../../redux/store";
import type { CategoryWithId } from "../../database/queries";

interface TableCategoryProps {
  type: string
  openModal: (id?: number) => void;
}

const TableCategory: React.FC<TableCategoryProps> = ({ type, openModal }) => {
  const dispatch = useAppDispatch();
  const getAllCategory = useAppSelector((state: RootState) => state.category.items);
  const [categories, setCategories] = useState<CategoryWithId[]>([]);

  useEffect(() => {
    setCategories(getAllCategory);
  }, [getAllCategory]);

  const handleRemove = (id: number) => {
    try {
      dispatch(deleteCategory(id));
      toast.success("Category removed successfully");
    } catch (error) {
      toast.error("Failed to remove category");
      console.error(error);
    }
  };

  return (
    <div className="flex gap-6 flex-wrap md:flex-nowrap border border-gray-200 rounded-lg">
      <div className="flex flex-col w-full bg-gray-50 shadow-md p-4">
        <div className="flex justify-between items-center mb-4 mt-0.5">
          <h2 className={`text-2xl font-semibold ml-1 ${type === "income" ? "text-green-800" : "text-red-800"}`}>
            {type === "income" ? "Income" : "Expense"}
          </h2>
          <button
            className="px-5 py-2.5 mr-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors duration-200"
            onClick={() => openModal()}
          >
            + Add Category
          </button>
        </div>

        <div className="rounded-sm h-48 max-h-48 overflow-auto">
          <table className="table-auto min-w-full text-sm rounded-sm shadow-md">
            <thead className="sticky top-0 bg-indigo-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white border-b border-indigo-900">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white border-b border-indigo-900">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white border-b border-indigo-900 w-1/5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 bg-white">
              {categories
                .filter(item => item.type === type)
                .map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.icon}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-evenly text-sm text-gray-900">
                        <FiEdit
                          className="cursor-pointer hover:text-blue-600 transition-colors   duration-150"
                          onClick={() => openModal(item.id)}
                          title="Edit"
                        />
                        <FiTrash
                          className="cursor-pointer hover:text-red-600 transition-colors  duration-150"
                          onClick={() => handleRemove(item.id)}
                          title="Delete"
                        />
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

export default TableCategory;
