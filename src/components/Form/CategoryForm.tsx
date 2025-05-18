import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useCategoryCrud } from '../../hook/useCategoryCrud';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../hook/redux_hook';
import { addCategory, editCategory } from '../../redux/category_slice';

interface CategoryFormProps {
  type: string;
  editId?: number | null;
  onClosed: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ type, onClosed, editId }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
      name: "",
      icon: "",
    });
  const [error, setError] = useState<string | null>(null);

  const { getByIdCategory, insertCategory, updateCategory } = useCategoryCrud();

  useEffect(() => {
    if (editId) {
      const fetchData = () => {
        try {
          const data = getByIdCategory(Number(editId));
          if (data) {
            setFormData({
              name: data.name || "",
              icon: data.icon || "",
            });
          }
        } catch (err) {
          console.error("Failed to fetch category:", err);
        }
      };
      fetchData();
    }
  }, [editId, getByIdCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, icon } = formData;

    if (!name || !icon) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      if (editId !== null) {
        const updated = await updateCategory({ ...formData, type, id: Number(editId) });
        if (updated) {
          dispatch(editCategory({
            ...formData, type, 
            id: Number(editId)
          }))
          toast.success('Category updated successfully!');
          clearInput();
          onClosed();
        } else {
          toast.error('Failed to update category.');
        }
      } else {
        const insertId = insertCategory({ ...formData, type });
        if (insertId) {
          dispatch(addCategory({
            ...formData, type, 
            id: Number(insertId)
          }))
          toast.success('Category added successfully!');
          clearInput();
          onClosed();
        } else {
          toast.error('Failed to add category.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    }
  };

  const clearInput = () => {
    setFormData({name: "", icon: ""})
    setError(null);
  };

  const isFormValid = formData.name && formData.icon;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      aria-labelledby="category-form-title"
    >
      <h2 id="category-form-title" className="text-2xl mb-4 font-semibold">
        {editId !== null ? 'Edit Category' : 'Add Category'}
      </h2>

      {error && (
        <motion.p
          className="mb-4 p-2 text-red-600 bg-red-50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </motion.p>
      )}

      <div className="mb-4">
        <label htmlFor="category-name" className="block text-gray-700 font-bold mb-2">
          Name
        </label>
        <motion.input
          id="category-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          aria-required="true"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="category-icon" className="block text-gray-700 font-bold mb-2">
          Icon
        </label>
        <motion.select
          id="category-icon"
          name="icon"
          value={formData.icon}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          aria-required="true"
        >
          <option value="" disabled>-- Select Icon --</option>
          <option value="💰">💰 Expense</option>
          <option value="💵">💵 Income</option>
        </motion.select>
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
        {editId !== null ? 'Update Category' : 'Add Category'}
      </motion.button>
    </motion.form>
  );
};

export default CategoryForm;
