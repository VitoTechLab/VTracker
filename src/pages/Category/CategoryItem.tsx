import { FiEdit, FiPlus, FiTrash } from "react-icons/fi";
import { useCategoryCrud } from "../../hook/useCategoryCrud";

interface CategoryItemProps {
  openModal: (id?: number) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ openModal }) => {
  const categories = [
  { id: 1, name: "Food", icon: "🍔" },
  { id: 2, name: "Transport", icon: "🚌" },
  { id: 3, name: "Work", icon: "💼" },
];

  const {remove} = useCategoryCrud();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Categories</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
        >
          <FiPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-gray-50 border rounded-lg p-4 flex flex-col items-center justify-between"
          >
            <div className="text-3xl mb-2">{cat.icon}</div>
            <div className="text-sm font-medium mb-2">{cat.name}</div>
            <div className="flex gap-2">
              <button onClick={() => openModal(cat.id)} className="text-gray-500 hover:text-blue-600">
                <FiEdit className="w-4 h-4" />
              </button>
              <button onClick={() => remove(cat.id)} className="text-red-500 hover:text-red-700">
                <FiTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryItem