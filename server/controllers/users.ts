import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { CommitteeData, UserWithToken } from '../../types';
import { Database } from '../db';
import { Committee } from '../interfaces/committee';
import { User } from '../interfaces/user';
import { serverConfig } from '../server-config';
import { getCommitteesForUser } from './committees';
import { isDisplayNameValid } from './validation';

const sql = Database.getInstance();

const users: User[] = [];

const addToCache = (user: User): void => {
    users.push(user);
};

const signUserToken = (id: string, username: string): string => {
    return jwt.sign({ id, username }, serverConfig.jwt.secretKey, { expiresIn: serverConfig.jwt.expiration });
};

const createUser = async (username: string, email: string, password: string, displayname: string): Promise<(boolean | string | UserWithToken)[]> => {
    const res = await createUserQuery(username, email, password, displayname);

    if (!res || !res[0]) {
        return [false, res[1]];
    }

    const idAndDate: string = res[1] as string;
    const user = new User(idAndDate.split('+')[0], username, email, password, displayname, idAndDate.split('+')[1]);
    addToCache(user);

    const token = signUserToken(user.id, user.username);
    return [true, { user, token }];
};

const loginUser = async (email: string, password: string): Promise<[boolean, string | UserWithToken]> => {
    const user: User | null = await findUserByEmail(email);

    if (!user) {
        return [false, 'User not found'];
    }

    if (await user.isPasswordCorrect(password)) {
        const token = signUserToken(user.id, user.username);

        return [true, { user, token }];
    } else {
        return [false, 'Password is incorrect'];
    }
};

const loginUserWithToken = async (token: string): Promise<UserWithToken | null> => {
    try {
        // Verify the token if it is present
        const decoded = await jwt.verify(token, serverConfig.jwt.secretKey);

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
    const committees = getCommitteesForUser(id);
    const data = committees.map((committee: Committee) => {
        return {
            id: committee.id,
            name: committee.name,
            description: committee.description,
            owner: committee.owner,
            members: committee.members
        } as CommitteeData;
    });
    return data;
};

const updateUserName = async (id: string, name: string): Promise<void> => {
    const user = await findUserById(id);
    if(user && isDisplayNameValid(name)) {
        user.displayname = name;

        await sql.query(
            `
			UPDATE users
			SET displayname = ?
			WHERE id = '${id}'';
		`,
            [name]
        );
    }
}

const debugUsers = (): void => {
    console.log(users);
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

const findUserByUsername = async (username: string): Promise<User | null> => {
    const cached = findCachedUserByUsername(username);

    if (cached) {
        return cached;
    } else {
        const user = await getUserByUsername(username);
        return user;
    }
};

// findCached methods are to search the users cache array synchronously
const findCachedUserById = (id: string): User | null => {
    return users.find((user) => user.id == id) ?? null;
};

const findCachedUserByEmail = (email: string): User | null => {
    return users.find((user) => user.email == email) ?? null;
};

const findCachedUserByUsername = (username: string): User | null => {
    return users.find((user) => user.username == username) ?? null;
};

// Database queries
// Get methods query the database for the user
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

const getUserByUsername = async (username: string): Promise<User | null> => {
    return new Promise((resolve, reject) => {
        if (!sql.initialized) {
            return reject(false);
        }
        if (!username) {
            return reject(false);
        }

        sql.query(`SELECT * FROM users WHERE username = ?`, [username], function (err, rows) {
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

const createUserQuery = (username: string, email: string, password: string, displayname: string): Promise<[boolean, string]> => {
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

export { createUser, loginUser, loginUserWithToken, getCommittees, updateUserName, debugUsers, findUserById, findUserByEmail, findUserByUsername };
