import initSqlJs from 'sql.js';
import { createCategoryTable, createTransactionTable } from './createTable';

type SqliteStoreData = {
  id: number;
  data: Uint8Array;
}

export const openIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("VitoTechLabFinanceTracker", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore("VitoTechLab", { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const initDatabase = async () => {
  try {
    const SQL = await initSqlJs({
      locateFile: file => import.meta.env.VITE_BASE_URL + file
      // locateFile: file => `/Personal-Finance-Tracker/wasm/${file}`
    });

    const IDB = await openIndexedDB();
    const tx = IDB.transaction("VitoTechLab", "readonly");
    const store = tx.objectStore("VitoTechLab");

    const getAllData = (): Promise<SqliteStoreData[]> => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    };

    const existingData = await getAllData();
    let localDb;

    if (existingData && existingData.length > 0 && existingData[0].data) {
      const uInt8Array = new Uint8Array(existingData[0].data);
      localDb = new SQL.Database(uInt8Array);
    } else {
      localDb = new SQL.Database();
      localDb.run(createCategoryTable);
      localDb.run(createTransactionTable);
    }

    return localDb;
  } catch (err) {
    console.error("Database init error:", err);
    throw err;
  }
};