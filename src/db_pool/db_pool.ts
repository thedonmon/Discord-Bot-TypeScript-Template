import pgLib from 'pg-promise';

import { createSingleton } from '../extensions/singleton.js';

const conn: string = process.env.PSQL_CONN;


const pgp = pgLib();

interface IDatabaseScope {
    db: pgLib.IDatabase<any>;
    pgp: pgLib.IMain;
}

export function getDB(): IDatabaseScope {
    return createSingleton<IDatabaseScope>('votebot-db-space', () => {
        return {
            db: pgp(conn),
            pgp,
        };
    });
}
