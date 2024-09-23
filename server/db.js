import mysql from 'mysql';
import {wrap} from "node-mysql-wrapper";

export class MySQL {
    constructor() {
        console.log('New MySQL instance created')
        this.connection = mysql.createConnection({
            host: '147.135.31.128',
            user: 'CSCI432FinalProject',
            password: 'FBEe8rDd8HCQ0bls',
            database: 'csci432project'
        });
        console.log('Database is connecting')
        let db = wrap(this.connection);
        this.db = db;
        db.ready(function(){
            console.log('Database is ready')
            // db.query(`
            //     INSERT INTO users
            //         (id, username, email, password, displayname, creationDate)
            //     VALUES
            //         ('912783ysdb-huda273iuj', 'admin', 'admin@localhost', 'admin', 'Admin', ${Date.now()});
            // `, function(err, rows, fields){
            //     console.log(err, rows, fields)
            // })
        });
    }
    ready(callback) {
        this.db.ready(callback)
    }
}


export default MySQL;
