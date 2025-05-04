declare module 'expo-sqlite' {
    import { SQLTransactionCallback, SQLTransactionErrorCallback, SQLStatementCallback, SQLStatementErrorCallback } from 'expo-sqlite/build/SQLite.types';
  
    export type SQLDatabase = {
      transaction: (
        callback: (tx: SQLTransaction) => void,
        error?: SQLTransactionErrorCallback,
        success?: () => void
      ) => void;
      exec: (queries: any[], readOnly: boolean, callback: (error: any, resultSet: any) => void) => void;
      close: () => void;
    };
  
    export interface SQLTransaction {
      executeSql(
        sqlStatement: string,
        args?: any[],
        successCallback?: SQLStatementCallback,
        errorCallback?: SQLStatementErrorCallback
      ): void;
    }
  
    export function openDatabase(name: string): WebSQLDatabase;
  }
  