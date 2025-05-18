import type {Database} from 'sql.js';
import { saveToIndexedDB } from '../hook/saveToIndexedDB';

export interface CategoryList {
  name: string;
  icon: string;
  type: string;
}

export interface TransactionList {
  name: string;
  categoryId: number;
  amount: number; 
  date: string;
  type: string;
}

export interface TransactionWithId extends TransactionList {
  id: number;
}

export interface CategoryWithId extends CategoryList {
  id: number;
}

export const addCategory = (db: Database, idb: IDBDatabase, category: CategoryList) => {
  const query = db.prepare("INSERT INTO category (name, icon, type) VALUES (?, ?, ?)");
  query.run([category.name, category.icon, category.type]);
  query.free();

  const result = db.exec("SELECT last_insert_rowid() AS id");
  const insertId = result?.[0]?.values?.[0]?.[0];
  saveToIndexedDB(db, idb);

  return insertId;
}

export const findAllCategory = (db: Database): CategoryWithId[] => {
  const query = db.prepare("SELECT * FROM category");
  const rows: CategoryWithId[] = [];

  while (query.step()) {
    rows.push(query.getAsObject() as unknown as CategoryWithId);
  }

  query.free();
  return rows;
}

export const findCategoryById = (db: Database, id: number): CategoryWithId | null => {
  const query = db.prepare("SELECT * FROM transactions WHERE id = ?");
  query.bind([id]);

  let result: CategoryWithId | null = null;
  if (query.step()) {
    result = query.getAsObject() as unknown as CategoryWithId;
  }

  query.free();
  return result;
}

export const editCategory = (
  db: Database,
  idb: IDBDatabase,
  cat: CategoryWithId,
) => {
  const query = db.prepare(`UPDATE category SET name = ?, icon = ?, type = ? WHERE id = ?`);

  query.run([cat.name, cat.icon, cat.type, cat.id]);
  query.free();

  return saveToIndexedDB(db, idb);
}

export const deleteCategory = (db: Database, idb: IDBDatabase, id: number) => {
  const query = db.prepare("DELETE FROM category WHERE id = ?");
  query.run([id]);
  query.free();

  return saveToIndexedDB(db, idb);
}

export const addTransaction = (
  db: Database, 
  idb: IDBDatabase,
  tx: TransactionList,
) => {
  const query = db.prepare(
    "INSERT INTO transactions (name, categoryId, amount, date, type) VALUES (?, ?, ?, ?, ?)"
  );

  query.run([tx.name, tx.categoryId, tx.amount, tx.date, tx.type]);
  query.free();

  const result = db.exec("SELECT last_insert_rowid() AS id");
  const insertId = result?.[0]?.values?.[0]?.[0];
  saveToIndexedDB(db, idb);
  
  return insertId;
}

export const findAllTransaction = (db: Database): TransactionWithId[] => {
  const query = db.prepare("SELECT * FROM transactions");
  const rows: TransactionWithId[] = [];

  while (query.step()) {
    rows.push(query.getAsObject() as unknown as TransactionWithId);
  }

  query.free();
  return rows;
}

export const findTransactionById = (db: Database, id: number): TransactionWithId | null => {
  const query = db.prepare("SELECT * FROM transactions WHERE id = ?");
  query.bind([id]);

  let result: TransactionWithId | null = null;
  if (query.step()) {
    result = query.getAsObject() as unknown as TransactionWithId;
  }

  query.free();
  return result;
}

export const editTransaction = (
  db: Database, 
  idb: IDBDatabase,
  tx: TransactionWithId,
) => {
  const query = db.prepare(`UPDATE transactions SET name = ?, categoryId = ?, amount = ?, date= ?, type = ?  WHERE id = ?`);

  query.run([tx.name, tx.categoryId, tx.amount, tx.date, tx.type, tx.id]);
  query.free();

  return saveToIndexedDB(db, idb);
}

export const deleteTransaction = (db: Database, idb: IDBDatabase, id: number) => {
  const query = db.prepare("DELETE FROM transactions WHERE id = ?");
  query.run([id]);
  query.free();

  return saveToIndexedDB(db, idb);
}