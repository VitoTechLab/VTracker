import { useEffect } from "react"
import { useTransactionCrud } from "./useTransactionCrud"
import { useCategoryCrud } from "./useCategoryCrud";
import { useAppDispatch } from './redux_hook';
import { setTransactions } from "../redux/transaction_slice";
import { setCategories } from "../redux/category_slice";


export const useLoadData = () => {
  const { getAllTransaction } = useTransactionCrud();
  const { getAllCategory } = useCategoryCrud();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setTransactions(getAllTransaction()));
    dispatch(setCategories(getAllCategory() ?? []));
  })
}