import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { UserWithToken } from '../../types';
import { Database } from '../db';
import { User } from '../interfaces/user';

const saltRounds = 10; // Typically a value between 10 and 12
const sql = Database.getInstance();

const SECRET_KEY = 'DEV_SECRET_KEY';

async function createUser(username: string, email: string, password: string, displayname: string): Promise<[boolean, string]> {
    return new Promise((resolve, reject) => {
        if (!displayname) displayname = username;
        if (!sql.initialized) return reject(false);
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
                // Handle error
                return reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    // Handle error
                    return reject(err);
                }
                const id = nanoid(16);
                // check if id or email is taken already if id is then make new one if email then error

                sql.query(`SELECT * FROM users WHERE email = ?`, [email], async function (err, rows) {
                    if (!err) {
                        if (rows.length > 0) {
                            return resolve([false, 'Email already exists!']);
                        } else {
                            sql.query(`SELECT * FROM users WHERE username = ?`, [username], async function (err, rows) {
                                if (!err) {
                                    if (rows.length > 0) {
                                        return resolve([false, 'Username already exists!']);
                                    } else {
                                        let idTaken: boolean = true;
                                        let wasError: boolean = false;
                                        while (idTaken && !wasError) {
                                            await sql.query(
                                                `SELECT *
															 FROM users
															 WHERE id = ?`,
                                                [id],
                                                function (err, rows) {
                                                    if (!err) {
                                                        if (rows.length > 0) {
                                                            console.log('ID already exists');
                                                            //id = nanoid(16);
                                                        } else {
                                                            idTaken = false;
                                                        }
                                                    } else {
                                                        wasError = true;
                                                        console.log('Error while performing Query ' + err);
                                                        return reject(err);
                                                    }
                                                }
                                            );
                                        }
                                        const cDate = Date.now();
                                        await sql.query(
                                            `
												INSERT INTO users
													(id, username, email, password, displayname, creationDate)
												VALUES (?, ?, ?, ?, ?, ?)
											`,
                                            [id, username, email, hash, displayname, cDate],
                                            function (err) {
                                                if (!err) {
                                                    return resolve([true, `${id}+${cDate}`]);
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
    public static instance: Users = new Users();
    private users: User[];
    private constructor() {
        this.users = [];
    }
    async createUser(username: string, email: string, password: string, displayname: string): Promise<(boolean | string | UserWithToken)[]> {
        const res = await createUser(username, email, password, displayname);
        if (!res || !res[0]) {
            return [false, res[1]];
        }
        const idAndDate: string = res[1] as string;
        const user = new User(idAndDate.split('+')[0], username, email, password, displayname, idAndDate.split('+')[1]);
        this.users.push(user);
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        return [true, { user, token }];
    }
    async loginUser(email: string, password: string): Promise<[boolean, string | UserWithToken]> {
        let user: User | undefined | null = this.findUserByEmail(email);
        if (!user) {
            user = await this.getUserFromEmail(email);
            if (user == null) {
                return [false, 'User not found'];
            }
        }
        if (await user.isPasswordCorrect(password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            return [true, { user, token }];
        } else {
            return [false, 'Password is incorrect'];
        }
    }

    async getUserProfile(token: string): Promise<UserWithToken | null> {
        // Verify the token if it is present
        try {
            const decoded = await jwt.verify(token, SECRET_KEY);

            const user = await this.getUserById((decoded as { id: string }).id);
            if (user) {
                return { user, token };
            }

            return null;
        } catch {
            return null;
        }
    }

    // Get Names are to query the database for the user
    getUserFromEmail(email: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
            if (!sql.initialized) {
                return reject(false);
            }
            if (!email) {
                return reject(false);
            }

            sql.query(`SELECT * FROM users WHERE email = ?`, [email], function (err, rows) {
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
    getUserById(id: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
            if (!sql.initialized) {
                return reject(false);
            }

            if (!id) {
                return reject(false);
            }

            sql.query(`SELECT * FROM users WHERE id = ?`, [id], (err, rows) => {
                if (!err) {
                    if (rows.length > 0) {
                        const row = rows[0];
                        const user = new User(row.id, row.username, row.email, row.password, row.displayname, row.creationDate);

                        // Add to users cache
                        this.users.push(user);
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
    findUserById(id: string): User | undefined {
        return this.users.find((user) => user.id === id);
    }
    findUserByUsername(username: string): User | undefined {
        return this.users.find((user) => user.username === username);
    }
    findUserByEmail(email: string): User | undefined {
        return this.users.find((user) => user.email === email);
    }

    // Checkers
    isEmailValid(email: string): boolean {
        if (!email) return false;
        if (email.length < 5) return false;
        if (email.length > 320) return false;
        // make sure there is text then an @ then text then a . then text
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
        return true;
    }
    isUsernameValid(username: string): Array<boolean | string> {
        if (!username) return [false, 'Username must be at least 3 characters long'];
        if (username.length < 3) return [false, 'Username must be at least 3 characters long'];
        if (username.length > 32) return [false, 'Username must be at most 32 characters long'];
        if (/^(?!.*[_]{2})[a-zA-Z0-9_]*[^_]$/.test(username) == false) return [false, 'Username must only contain letters, numbers, underscores and periods'];
        return [true, ''];
    }
    isPasswordValid(password: string): boolean {
        if (!password) return false;
        if (password.length < 3) return false;
        if (password.length > 64) return false;
        // make sure no spaces
        if (password.includes(' ')) return false;
        // make sure only english letters and numbers and some special characters
        if (!/^[a-zA-Z0-9!@#$%^&*()_+-=]*$/.test(password)) return false;
        return true;
    }
    isDisplayNameValid(displayname: string): boolean {
        if (!displayname) return false;
        if (displayname.length < 3) return false;
        if (displayname.length > 32) return false;
        return true;
    }
}
