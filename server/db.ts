import { Connection, createPool, Pool } from 'mysql';
import { wrap } from 'node-mysql-wrapper';

export class MySQL {
    public connection: Connection;
    public pool: Pool;
    public db: any;

    constructor() {
        console.log('New MySQL instance created');
        const pool = createPool({
            host: '147.135.31.128',
            user: 'CSCI432FinalProject',
            password: 'FBEe8rDd8HCQ0bls',
            database: 'csci432project',
            port: 3306
        });

        pool.on('error', function (err) {
            console.log('Database error', err);
        });

        console.log('Database is connecting');
        this.pool = pool;
    }
    ready(callback): void {
        this.pool.getConnection((err, connection) => {
            this.db = wrap(connection);
            this.db.ready(callback);
        });
    }

    query(query: string, data: object | undefined = [], p: (err, rows, fields) => void = (): void => {}): Promise<any> {
        if (data && typeof data === 'function' && p == undefined) {
            p = data as any;
            data = undefined;
        }

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                this.db = wrap(connection);
                connection.query(query, data, function (err, rows, fields) {
                    if (p) p(err, rows, fields);
                    if (err) {
                        reject(err);
                    }
                    connection.release();
                    resolve(rows);
                });
            });
        });
    }
}
