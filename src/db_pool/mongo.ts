import mongoose from 'mongoose';
import { createRequire } from 'node:module';

import { createSingleton } from '../extensions/singleton.js';

const require = createRequire(import.meta.url);

let Config = require('../../config/config.json');

interface IDatabaseScope {
    db: mongoose.Connection;
}

export function getDB(): IDatabaseScope {
    return createSingleton<IDatabaseScope>('votebot-db-space', () => {
        mongoose.connect(Config.db.mongo_connection, {
            dbName: 'monke_votes',
        });
        return {
            db: mongoose.connection,
        };
    });
}
