import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CategoryWithId } from "../database/queries"; 

interface CategoryState {
  items: CategoryWithId[];
}

const initialState: CategoryState = {
  items: [],
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<CategoryWithId[]>) {
      state.items = action.payload;
    },
    addCategory(state, action: PayloadAction<CategoryWithId>) {
      state.items.push(action.payload);
    },
    deleteCategory(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    editCategory(state, action: PayloadAction<CategoryWithId>) {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const {
  setCategories,
  addCategory,
  deleteCategory,
  editCategory,
} = categorySlice.actions;

export default categorySlice.reducer;
