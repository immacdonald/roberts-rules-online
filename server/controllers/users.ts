import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { CommitteeData, UserWithToken } from '../../types';
import { Database } from '../db';
import { User } from '../interfaces/user';
import { populateCommitteeMembers } from './committees';

const sql = Database.getInstance();

const SECRET_KEY = 'DEV_SECRET_KEY';

const users: User[] = [];

const addToCache = (user: User): void => {
    users.push(user);
};

const createUser = async (username: string, email: string, password: string, displayname: string): Promise<(boolean | string | UserWithToken)[]> => {
    const res = await createUserQuery(username, email, password, displayname);
    if (!res || !res[0]) {
        return [false, res[1]];
    }
    const idAndDate: string = res[1] as string;
    const user = new User(idAndDate.split('+')[0], username, email, password, displayname, idAndDate.split('+')[1]);
    addToCache(user);
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    return [true, { user, token }];
};

const loginUser = async (email: string, password: string): Promise<[boolean, string | UserWithToken]> => {
    const user: User | null = await findUserByEmail(email);

    if (!user) {
        return [false, 'User not found'];
    }

    if (await user.isPasswordCorrect(password)) {
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        return [true, { user, token }];
    } else {
        return [false, 'Password is incorrect'];
    }
};

const loginUserWithToken = async (token: string): Promise<UserWithToken | null> => {
    try {
        // Verify the token if it is present
        const decoded = await jwt.verify(token, SECRET_KEY);

        const user = await findUserById((decoded as { id: string }).id);
        if (user) {
            return { user, token };
        } else {
            return null;
        }
    } catch {
        return null;
    }
};

const getCommittees = async (id: string): Promise<CommitteeData[] | null> => {
    return new Promise((resolve, reject) => {
        sql.query("SELECT * FROM committees WHERE owner = ? OR JSON_EXISTS(members, CONCAT('$.', ?))", [id, id], async (err, res) => {
            if (!err) {
                const data: CommitteeData[] = res.map((row: any) => ({
                    ...row,
                    members: JSON.parse(row.members)
                }));

                const clientTable = populateCommitteeMembers(data);
                resolve(clientTable);
            } else {
                reject(null);
            }
        });
    });
};

const debugUsers = (): void => {
    console.log(users);
};

// Get methods query the database for the user
const getUserByEmail = async (email: string): Promise<User | null> => {
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

                    // Add to users cache
                    addToCache(user);
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

const getUserById = async (id: string): Promise<User | null> => {
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
                    addToCache(user);
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

// Find methods first check the cache and then query the database
const findUserById = async (id: string): Promise<User | null> => {
    const cached = findCachedUserById(id);

    if (cached) {
        return cached;
    } else {
        const user = await getUserById(id);
        return user;
    }
};

const findUserByEmail = async (email: string): Promise<User | null> => {
    const cached = findCachedUserByEmail(email);

    if (cached) {
        return cached;
    } else {
        const user = await getUserByEmail(email);
        return user;
    }
};

// findCached methods are to search the users cache array synchronously
const findCachedUserById = (id: string): User | null => {
    return users.find((user) => user.id === id) ?? null;
};

const findCachedUserByEmail = (email: string): User | null => {
    return users.find((user) => user.email === email) ?? null;
};

// Database query
async function createUserQuery(username: string, email: string, password: string, displayname: string): Promise<[boolean, string]> {
    return new Promise((resolve, reject) => {
        if (!displayname) {
            displayname = username;
        }
        if (!sql.initialized) {
            return reject(false);
        }

        bcrypt.genSalt(10, (err, salt) => {
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

export { createUser, loginUser, loginUserWithToken, getCommittees, debugUsers, findUserById, findUserByEmail };
