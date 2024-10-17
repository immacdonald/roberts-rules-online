import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { MySQL } from '../db';
import { User } from './user';

const saltRounds = 10; // Typically a value between 10 and 12
const sql = new MySQL();
let dbReady = false;

sql.ready(async function () {
    dbReady = true;
    Users.dbReady = dbReady;
});

async function createUser(username, email, password, displayname): Promise<[string, number] | boolean> {
    return new Promise((resolve, reject) => {
        if (!displayname) displayname = username;
        if (!dbReady) return reject(false);
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
											await sql.query(`SELECT *
															 FROM users
															 WHERE id = ?`, [id], function (err, rows) {
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
											});
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
													return resolve([true, id, cDate]);
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
    public static dbReady = dbReady;
    private users: User[];
    private constructor() {
        this.users = [];
    }
    async createUser(username, email, password, displayname): Promise<(boolean | string | number | User)[]> {
        const res = await createUser(username, email, password, displayname);
        if (!res || !res[0]) return [false, res[1]];
        const user = new User(res[1], username, email, password, displayname, res[2]);
        this.users.push(user);
        return [true, user];
    }
    async loginUser(email: string, password: string): Promise<[boolean, string | User]> {
        let user: User | undefined | null = this.findUserByEmail(email);
        if (!user) {
            user = await this.getUserFromEmail(email);
            if (user == null) {
                return [false, 'User not found'];
            }
        }
        if (await user.isPasswordCorrect(password)) {
            return [true, user];
        } else {
            return [false, 'Password is incorrect'];
        }
    }

    dbReady(callback): void {
        sql.ready(callback);
    }

    // Get Names are to query the database for the user
    getUserFromEmail(email: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
            if (!Users.dbReady) return reject(false);
            if (!email) return reject(false);
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
			if (!Users.dbReady) return reject(false);
			if (!id) return reject(false);
			sql.query(`SELECT * FROM users WHERE id = ?`, [id], function (err, rows) {
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
	};

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
        if (!username) return [false, "Username must be at least 3 characters long"];
        if (username.length < 3) return [false, "Username must be at least 3 characters long"];
        if (username.length > 32) return [false, "Username must be at most 32 characters long"];
        if ((/^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(username) == false)) return [false, "Username must only contain letters, numbers, underscores and periods"];
        return [true, ""];
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
