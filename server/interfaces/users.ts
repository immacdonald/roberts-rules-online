import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { MySQL } from '../db';
import { User } from './user';

const saltRounds = 10; // Typically a value between 10 and 12
const red = '\\x1b[31m';
// const green = '\\x1b[32m';
const reset = '\\x1b[0m';
const sql = new MySQL();
let dbReady = false;

sql.ready(async function () {
    dbReady = true;
    // createUser('admin', 'admin@localhost', 'thisIsPassword', 'Admin')
});

async function createUser(username, email, password, displayname) {
    return new Promise((resolve, reject) => {
        if (!displayname) displayname = username;
        if (!dbReady) return reject(false);
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
                // Handle error
                return reject(err);
            }
            const userPassword = 'user_password'; // Replace with the actual password
            bcrypt.hash(userPassword, salt, (err, hash) => {
                if (err) {
                    // Handle error
                    return reject(err);
                }
                let id = nanoid(16);
                // check if id or email is taken already if id is then make new one if email then error

                sql.db.query(`SELECT * FROM users WHERE email = '${email}'`, function (err, rows) {
                    if (!err) {
                        if (rows.length > 0) {
                            console.log(red + 'Email already exists' + reset);
                            return reject('Email already exists');
                        } else {
                            let idTaken: boolean = true;
                            let wasError: boolean = false;
                            while (idTaken && !wasError) {
                                sql.db.query(`SELECT * FROM users WHERE id = '${id}'`, function (err, rows) {
                                    if (!err) {
                                        if (rows.length > 0) {
                                            id = nanoid(16);
                                        } else {
                                            idTaken = false;
                                        }
                                    } else {
                                        wasError = true;
                                        console.log('Error while performing Query ' + err);
                                        return reject(err);
                                    }
                                });
                            }
                            const cDate = Date.now();
                            sql.db.query(
                                `
								INSERT INTO users
									(id, username, email, password, displayname, creationDate)
								VALUES
									('${id}', '${username}', '${email}', '${hash}', '${displayname}', ${cDate});
							`,
                                function (err) {
                                    if (!err) {
                                        return resolve([id, cDate]);
                                    } else {
                                        console.log('Error while performing Query ' + err);
                                        return reject(err);
                                    }
                                }
                            );
                        }
                    } else {
                        console.log('Error while performing Query ' + err);
                        return reject(err);
                    }
                });
            });
        });
    });
}

export class Users {
    private users: User[];
    constructor() {
        this.users = [];
    }
    async createUser(username, email, password, displayname) {
        const res = await createUser(username, email, password, displayname);
        if (!res) return false;
        const user = new User(res[0], username, email, password, displayname, res[1]);
        this.users.push(user);
        return user;
    }
    async loginUser(email: string, password: string) {
        const user: User | null = this.findUserByEmail(email);
        if (user == null) {
            const user = await this.getUserFromEmail(email);
            if (user == null) {
                return [false, 'User not found'];
            }
        }
        if (await user.isPasswordCorrect(password)) {
            return user;
        } else {
            return [false, 'Password is incorrect'];
        }
    }

    // Get Names are to query the database for the user
    getUserFromEmail(email: string) {
        return new Promise((resolve, reject) => {
            if (!dbReady) return reject(false);
            if (!email) return reject(false);
            sql.query(`SELECT * FROM users WHERE email = '${email}'`, function (err, rows) {
                if (!err) {
                    if (rows.length > 0) {
                        const row = rows[0];
                        const user = new User(row.id, row.username, row.email, row.password, row.displayname, row.creationDate);
                        return resolve(user);
                    } else {
                        return resolve(null);
                    }
                } else {
                    console.log('Error while performing Query: ' + err);
                    return reject(err);
                }
            });
        });
    }

    // Find Names are to search the users array
    findUserById(id: string) {
        return this.users.find((user) => user.id === id);
    }
    findUserByUsername(username: string) {
        return this.users.find((user) => user.username === username);
    }
    findUserByEmail(email: string) {
        return this.users.find((user) => user.email === email);
    }
}
