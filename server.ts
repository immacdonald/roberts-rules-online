import express, {Express, Request, Response} from 'express';
import ViteExpress from 'vite-express';
import {MySQL} from './server/db.js';
import {nanoid} from "nanoid";
import bcrypt from 'bcrypt';
const saltRounds = 10; // Typically a value between 10 and 12

const red = '\\x1b[31m';
const green = '\\x1b[32m';
const reset = '\\x1b[0m';

let sql = new MySQL;
let dbReady = false;
sql.ready(async function () {
    dbReady = true;
    createUser('admin', 'admin@localhost', 'thisIsPassword', 'Admin')
})

async function createUser(username, email, password, displayname) {
    if (!displayname) displayname = username;
    if (!dbReady) return false;

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            // Handle error
            return;
        }
        const userPassword = 'user_password'; // Replace with the actual password
        bcrypt.hash(userPassword, salt, (err, hash) => {
            if (err) {
                // Handle error
                return;
            }
            let id  = nanoid(16)
            // check if id or email is taken already if id is then make new one if email then error

            sql.db.query(`SELECT * FROM users WHERE email = '${email}'`, function(err, rows, fields){
                if (!err) {
                    if (rows.length > 0) {
                        console.log(red+'Email already exists'+reset);
                        return;
                    }else {
                        let idTaken = true;
                        while (idTaken) {
                            sql.db.query(`SELECT * FROM users WHERE id = '${id}'`, function(err, rows, fields){
                                if (!err) {
                                    if (rows.length > 0) {
                                        id = nanoid(16)
                                    }else {
                                        idTaken = false;
                                    }
                                }else {
                                    console.log('Error while performing Query ' + err);
                                }
                            })
                        }

                        sql.db.query(`
                            INSERT INTO users 
                                (id, username, email, password, displayname, creationDate) 
                            VALUES 
                                ('${id}', '${username}', '${email}', '${hash}', '${displayname}', ${Date.now()});
                        `, function(err, rows, fields){
                            if (!err) {
                                console.log('The solution is: ', rows);
                            }else {
                                console.log('Error while performing Query ' + err);
                            }
                            sql.db.query(`SELECT * FROM users`, function(err, rows, fields){
                                if (!err) {
                                   for (let i = 0; i < rows.length; i++) {
                                       if (bcrypt.compare(userPassword, rows[i].password)) {
                                           console.log('User password is correct', rows[i].username);
                                       } else {
                                           console.log('User password is incorrect');
                                       }
                                   }
                                }else {
                                    console.log('Error while performing Query ' + err);
                                }
                            })
                        })

                    }
                }else {
                    console.log('Error while performing Query ' + err);
                }
            })
        });
    });
}

const app: Express = express();
const port: number = 3000;

const API = '/api/v1';

app.get(`${API}/ping`, (_: Request, res: Response) => {
    // Sends a friendly message and a 200 status (implicitly)
    res.send('Hello, this is the Express API.');
});

app.get(`${API}/test`, (req: Request, res: Response) => {
    // Sends test JSON data
    res.json([1, 2, 3, 4, 5]);
});

ViteExpress.listen(app, port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
