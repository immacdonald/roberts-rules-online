import {createConnection, Connection} from 'mysql';
import { wrap } from 'node-mysql-wrapper';

export class MySQL {
    public connection: Connection;
    public db: any;

    constructor() {
        console.log('New MySQL instance created');
        this.connection = createConnection({
            host: '147.135.31.128',
            user: 'CSCI432FinalProject',
            password: 'FBEe8rDd8HCQ0bls',
            database: 'csci432project'
        });
        console.log('Database is connecting');
        const db = wrap(this.connection);
        this.db = db;
        db.ready(function () {
            console.log('Database is ready');
        });
    }
    ready(callback):void {
        this.db.ready(callback);
    }
    query(query);
    query(query, callback):Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.query(query, function (err, rows, fields) {
                if (callback) callback(err, rows, fields);
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }
}
