// import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// import type { Database } from "sql.js";

// interface DatabaseStore {
//   db: Database | null;
//   idb: IDBDatabase | null;
// }

// const initialState: DatabaseStore = {
//   db: null,
//   idb: null,
// };

// const databaseSlice = createSlice({
//   name: 'database',
//   initialState,
//   reducers: {
//     setDatabase: (state, action: PayloadAction<{ db: Database; idb: IDBDatabase }>) => {
//       state.db = action.payload.db;
//       state.idb = action.payload.idb;
//     },
//   }
// })

// export const {setDatabase} = databaseSlice.actions;
// export default databaseSlice.reducer;