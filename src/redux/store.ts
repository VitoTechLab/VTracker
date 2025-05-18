import { configureStore } from "@reduxjs/toolkit";
import navReducer from "./nav_slice";
import transactionReducer from "./transaction_slice";
import categoryReducer from "./category_slice";

export const store = configureStore({
  reducer: { 
    nav: navReducer,
    transaction: transactionReducer,
    category: categoryReducer,
  },  
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

