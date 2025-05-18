// redux/transactionSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TransactionWithId } from "../database/queries";

interface TransactionState {
  items: TransactionWithId[];
}

const initialState: TransactionState = {
  items: [],
};

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<TransactionWithId[]>) {
      state.items = action.payload;
    },
    addTransaction(state, action: PayloadAction<TransactionWithId>) {
      state.items.push(action.payload);
    },
    deleteTransaction(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    editTransaction(state, action: PayloadAction<TransactionWithId>) {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const {
  setTransactions,
  addTransaction,
  deleteTransaction,
  editTransaction,
} = transactionSlice.actions;

export default transactionSlice.reducer;
