import { createPool, Pool } from 'mysql';
import { wrap } from 'node-mysql-wrapper';
import 'dotenv/config';

export class Database {
    private static instance: Database;
    public initialized: boolean = false;
    public pool: Pool;
    public db: any;

    constructor() {
        console.log('New MySQL database instance created');

        const pool = createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT!)
        });

        pool.on('error', function (err) {
            console.log('Database error', err);
        });

        console.log('Database is connecting');
        this.pool = pool;
    }
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public ready(callback: () => void): void {
        this.initialized = true;
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
