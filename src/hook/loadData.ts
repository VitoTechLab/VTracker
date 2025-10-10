import { useEffect } from "react";
import { useTransactionCrud } from "./useTransactionCrud";
import { useCategoryCrud } from "./useCategoryCrud";
import { useAppDispatch } from "./redux_hook";
import { setTransactions } from "../redux/transaction_slice";
import { setCategories } from "../redux/category_slice";


export const useLoadData = () => {
  const { getAllTransaction } = useTransactionCrud();
  const { getAllCategory } = useCategoryCrud();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const transactions = getAllTransaction();
    const categories = getAllCategory() ?? [];

    if (transactions !== undefined) {
      dispatch(setTransactions(transactions));
    }

    dispatch(setCategories(categories));
  }, [dispatch, getAllCategory, getAllTransaction]);
};
