import { createPool, Pool } from 'mysql';
import { wrap } from 'node-mysql-wrapper';

export class MySQL {
    private static instance: MySQL;
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
    public static getInstance(): MySQL {
        if (!MySQL.instance) {
            MySQL.instance = new MySQL();
        }
        return MySQL.instance;
    }

    public ready(callback: () => void): void {
        this.pool.getConnection((_, connection) => {
            this.db = wrap(connection);
            this.db.ready(callback);
        });
    }

    public query(query: string, data: any[] = [], p: (err: any, rows: any, fields: any) => void = (): void => {}): Promise<any> {
        //console.log('Querying', query, data);
        return new Promise((resolve, reject) => {
            this.pool.getConnection((_, connection) => {
                this.db = wrap(connection);
                try {
                    connection.query(query, data, function (err, rows, fields) {
                        if (p) p(err, rows, fields);
                        if (err) {
                            reject(err);
                        }
                        connection.release();
                        resolve(rows);
                    });
                } catch (err) {
                    if (p) p(err, null, null);
                    reject(err);
                    connection.release();
                }
            });
        });
    }
}
