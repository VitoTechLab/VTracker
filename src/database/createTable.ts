export const createCategoryTable = `
  CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
  );
`;

export const createTransactionTable = `
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    date TEXT NOT NULL,
    categoryId INTEGER,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    FOREIGN KEY (categoryId) REFERENCES category(id) ON DELETE SET NULL
  );
`;