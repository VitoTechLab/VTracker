import { useEffect, useState } from "react";
import { initDatabase, openIndexedDB } from "../database/db";
import type { Database } from "sql.js";

let cachedDb: Database | null = null;
let cachedIdb: IDBDatabase | null = null;

export const useDatabase = () => {
  const [database, setDatabase] = useState<{db: Database, idb: IDBDatabase}>();

  useEffect(() => {
    const loadDB = async () => {
      if (cachedDb && cachedIdb) {
        setDatabase({ db: cachedDb, idb: cachedIdb });
        return;
      }

      const db = await initDatabase();
      const idb = await openIndexedDB();

      cachedDb = db;
      cachedIdb = idb;
      setDatabase({ db, idb });
    };

    loadDB();
  }, []);

  return database;
};
