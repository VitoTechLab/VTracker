import { useCallback } from 'react';
import {
  addCategory,
  deleteCategory,
  editCategory,
  findAllCategory,
  findCategoryById,
  type CategoryList,
  type CategoryWithId,
} from '../database/queries';
import { useDatabase } from './useDatabase';

export const useCategoryCrud = () => {
  const database = useDatabase();

  const insertCategory = useCallback(
    (category: CategoryList) => {
        if (!database?.db || !database?.idb) return;
      try {
        return addCategory(database.db, database.idb, category);
      } catch (error) {
        console.error('Failed to insert category:', error);
        return false;
      }
    },
    [database]
  );

  const updateCategory = useCallback(
    async (category: CategoryWithId) => {
      try {
        if (!database?.db || !database?.idb) return;
        await editCategory(database.db, database.idb, category);
        return true;
      } catch (error) {
        console.error('Failed to update category:', error);
        return false;
      }
    },
    [database]
  );

  const removeCategory = useCallback(
    async (id: number) => {
      try {
        if (!database?.db || !database?.idb) return;
        await deleteCategory(database.db, database.idb, id);
        return true;
      } catch (error) {
        console.error('Failed to delete category:', error);
        return false;
      }
    },
    [database]
  );

  const getAllCategory = useCallback(() => {
    try {
      if (!database?.db) {
        return [];
      }
      return findAllCategory(database.db);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }, [database]);

  const getByIdCategory = useCallback( (id: number) => {
      if (!database?.db) return null;
      try {
        return findCategoryById(database.db, id);
      } catch (error) {
        console.error('Failed to fetch transaction by ID:', error);
        return null;
      }
    },[database]);

  return {
    insertCategory,
    updateCategory,
    removeCategory,
    getAllCategory,
    getByIdCategory
  };
};
