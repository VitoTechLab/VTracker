import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NavState {
  isOpen: boolean;
  selectedMenu: number;
}

const initialState: NavState = {
  isOpen: true,    
  selectedMenu: 0,
};

const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.isOpen = !state.isOpen; },
    setSelectedMenu: (state, action: PayloadAction<number>) => { state.selectedMenu = action.payload; },
  },
})

export const { toggleSidebar, setSelectedMenu } = navSlice.actions;
export default navSlice.reducer;