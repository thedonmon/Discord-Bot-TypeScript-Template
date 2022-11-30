import { ColumnSet } from 'pg-promise';

import { getDB } from './db_pool.js';

const { db, pgp } = getDB();

export class Db {
    public static async executeone(query: string, values: any[]): Promise<any> {
        const res = await db.one(query, values);
        return res;
    }

    public static async insertmany(columnSet: ColumnSet, values: any[]): Promise<any> {
        const query = pgp.helpers.insert(values, columnSet);
        const res = await db.many(query);
        return res;
    }

    public static async updatemany(columnSet: ColumnSet, values: any[]): Promise<any> {
        const query = pgp.helpers.update(values, columnSet);
        const res = await db.many(query);
        return res;
    }

    public static createColumnSet(columns: string[], table: string): ColumnSet {
        return new pgp.helpers.ColumnSet(columns, { table });
    }

    public static onConflict(
        columnSet: ColumnSet,
        conflictColumns: string[],
        setColumn: string
    ): string {
        const columns = conflictColumns.join(',');
        const onConflict =
            ` ON CONFLICT(${columns}) DO UPDATE SET ` +
            columnSet.assignColumns({ from: 'EXCLUDED', skip: setColumn });
        return onConflict;
    }
}
