import SqliteDatabase from "better-sqlite3";
import { mkdir } from "fs/promises";

export type Database = SqliteDatabase.Database;

export const initDatabase = (dbPath: string): Database => {
    const db = new SqliteDatabase(dbPath, { verbose: console.log });
    db.pragma("journal_mode = WAL");

    return db;
};
