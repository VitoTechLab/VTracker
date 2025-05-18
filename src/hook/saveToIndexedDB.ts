import type { Database } from 'sql.js';

export const saveToIndexedDB = (db: Database, IDB: IDBDatabase) => {
  return new Promise<void>((resolve, reject) => {
    const binaryArray = db.export();

    const tx = IDB.transaction('VitoTechLab', 'readwrite');
    const store = tx.objectStore('VitoTechLab');

    const request = store.put({
      id: 1,
      data: binaryArray,
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};