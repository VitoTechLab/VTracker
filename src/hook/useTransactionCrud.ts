import { useCallback } from 'react';
import {
  addTransaction,
  deleteTransaction,
  editTransaction,
  findAllTransaction,
  findTransactionById,
  type TransactionList,
  type TransactionWithId,
} from '../database/queries';
import { useDatabase } from './useDatabase';

export const useTransactionCrud = () => {
  const database = useDatabase();

  const insertTransaction = useCallback(
    (transaction: TransactionList) => {
      if (!database?.db || !database?.idb) return;
      
      try {
        return addTransaction(database.db, database.idb, transaction);
      } catch (error) {
        console.error('Failed to insert transaction:', error);
        return false;
      }
    },
    [database]
  );

  const updateTransaction = useCallback(
    async (transaction: TransactionWithId) => {
      if (!database?.db || !database?.idb) return;
      
      try {
        await editTransaction(database.db, database.idb, transaction);
        return true;
      } catch (error) {
        console.error('Failed to update transaction:', error);
        return false;
      }
    },
    [database]
  );

  const removeTransaction = useCallback(
    async (id: number) => {
      if (!database?.db || !database?.idb) return;
      
      try {
        await deleteTransaction(database.db, database.idb, id);
        return true;
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        return false;
      }
    },
    [database]
  );

  const getAllTransaction = useCallback(() => {
    if (!database?.db) return [];
    try {
      return findAllTransaction(database.db);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  }, [database]);

  const getByIdTransaction = useCallback((id: number) => {
      if (!database?.db) return null;
      try {
        return findTransactionById(database.db, id);
      } catch (error) {
        console.error('Failed to fetch transaction by ID:', error);
        return null;
      }
    }, [database]);

  return {
    insertTransaction,
    updateTransaction,
    removeTransaction,
    getAllTransaction,
    getByIdTransaction,
  };
};