import { createServer } from 'http';
import express, { Express, Request, Response, static as eStatic } from 'express';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import ViteExpress from 'vite-express';
import { createDatabase } from './server/createDBTables';
import { Committees, Committees as CommitteesClass } from './server/interfaces/Committees';
import { User } from './server/interfaces/user';
import { Users as UsersClass } from './server/interfaces/users';
import { CommitteeData, UserWithToken } from './types';
import { MySQL } from './server/db';
import { Motions, Motions } from './server/interfaces/motions';

const SECRET_KEY = 'DEV_SECRET_KEY';

createDatabase();

const Users: UsersClass = UsersClass.instance;
//const Committees: CommitteesClass = CommitteesClass.instance;
CommitteesClass.setUsersClass();

const app: Express = express();
app.use(express.json());

// Middleware to block any requests made before the database is connected
app.use((_, res, next) => {
    if (!UsersClass.initialized) {
        setTimeout(() => {
            if (UsersClass.initialized) {
                next();
            } else {
                console.log("Rejecting request due to database disconnect")
                res.sendStatus(503);
            }
        })
    } else {
        next();
    }
});

const server = createServer(app);

const port: number = 3000;
const io = new Server(server, {
    cors: {
        origin: `http://localhost:${port}`
    }
});

const vite = await createViteServer({
    server: {
        middlewareMode: true,
        hmr: {
            server,
            // @ts-expect-error when connecting ViteExpress
            ViteExpress
        }
    },
    appType: 'spa'
});

const API = '/api/v1';
app.get(`${API}/ping`, (_: Request, res: Response) => {
    // Sends a friendly message and a 200 status (implicitly)
    res.send('Hello, this is the Express API.');
});

// Login route
app.post(`${API}/login`, async (req, res) => {
    const { email, password, token } = req.body;

    //if (!dbReady) return res.status(500).json({ success: false, message: 'Database not ready' });
    if (email && password) {
        try {

            const [isLoggedIn, response] = await Users.loginUser(email, password);
            if (isLoggedIn) {
                const data = response as UserWithToken;
                res.status(200).json({ success: true, data });
            } else {
                res.status(401).json({ success: false, message: response });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error during login' });
        }
    } else {
        try {
            const response = await Users.getUserProfile(token);
            if (response) {
                res.status(200).json({ success: true, data: response });
            } else {
                res.status(401).json({ success: false, message: "Invalid or expired token" });
            }
        } catch (error) {
            res.status(401).json({ success: false, message: error });
        }
    }
});

io.use((socket, next) => {
    const token = socket.handshake.query.token;

    // Proceed normally if no token is provided
    if (!token) {
        console.log('No token provided, allowing anonymous connection');
        return next();
    }

    // Verify the token if it is present
    jwt.verify(token as string, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log('Failed to authenticate token:', err.message);
            //return next(new Error('Authentication error'));
            return next();
        }
        else if (!decoded) {
            console.log('Failed to decode token');
            return next();
        } else {
            const user = (decoded as {username: string, id: string});
            socket.data.username = user.username;
            socket.data.id = user.id;
            console.log(`Successfully authenticated user ${user.username} from JWT`);
        }
    });

    return next();
});

io.on('connection', (socket: Socket) => {
    console.log(`Client is connected (${socket.data.username})`);

    socket.on('chatMessage', (msg) => {
        console.log('message: ' + msg);
    });

    const sql = MySQL.getInstance();

    socket.on('getCommittees', async () => {
        const id = socket.data.id;
        console.log("Getting committees!")
        await sql.query("SELECT * FROM committees WHERE owner = ? OR JSON_EXISTS(members, CONCAT('$.', ?))", [id, id], async (err, res) => {
            if (!err) {
                //const data = JSON.parse(JSON.stringify(res));
                const data: CommitteeData[] = res.map((row: any) => ({
                    ...row,
                    members: JSON.parse(row.members)
                }));

                const clientTable = await CommitteesClass.instance.populateCommitteeMembers(data);
                socket.emit('setCommittees', clientTable);
                //this.socket.emit('setCommittees', data);
            }
        });
    })

    socket.on('getMotions', async (committeeId) => {
        if (!committeeId) {
            return;
        }
        const thisCommittee = CommitteesClass.instance.getCommitteeById(committeeId);
        if (thisCommittee) {
            const motions = await thisCommittee.getMotions(false);
            console.log("Got motions", motions);
            if (motions) {
                socket.emit('setMotions', motions);
            }
        }else {
            console.log('Committee not found');
            return socket.emit('setMotions', []);
        }
    });

    socket.on("createMotion", async (committeeId, title) => {
        if (!committeeId) {
            return;
        }

        const id = socket.data.id;
        const motion = new Motions(committeeId);

        motion.createLightweightMotion(committeeId, id, title);
    });

    // login
    socket.on('login', (username, password) => {
        console.log('Logging in...');
        console.log(username);
        console.log(password);
        Users.loginUser(username, password).then(([success, data]) => {
            if (success) {
                const user = data as User;
                const token = jwt.sign({ id: user.id, username: user.username, displayname: user.displayname, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
                socket.emit('login', user, token);
                user.setSocket(socket);
            } else {
                console.log(`Error logging in: ${data}`);
            }
        });
    });

    socket.on('register', (username, email, password, displayname) => {
        console.log('Registering...');
        console.log(username);
        console.log(email);
        console.log(password);
        if (!displayname) {
            displayname = username;
        }

        const [validUsername, err_msg_username] = Users.isUsernameValid(username);
        if (!validUsername) {
            socket.emit('failedRegister', err_msg_username);
            return false;
        }
        if (!Users.isEmailValid(email)) {
            socket.emit('failedRegister', 'Email is not valid.');
            return false;
        }
        if (!Users.isPasswordValid(password)) {
            socket.emit('failedRegister', 'Password is not valid.');
            return false;
        }
        if (!Users.isDisplayNameValid(displayname)) {
            socket.emit('failedRegister', 'Display name is not valid.');
            return false;
        }

        Users.createUser(username, email, password, displayname)
            .then((res) => {
                const r = res[0];
                const val = res[1];
                if (r) {
                    if (val instanceof User) {
                        val.setSocket(socket);
                        socket.emit('login', val.username, val.email, val.displayname);
                    }
                } else {
                    socket.emit('failedRegister', val);
                }
            })
            .catch((e) => {
                console.log(e);
                socket.emit('failedRegister', 'An error occurred while registering.');
            });
    });
});

Users.dbReady(async () => {
    //console.log('Users Database is ready');
    //Committees.createCommittee('Test Committee', 'lmao', 'EzdWsg7lDcA6n-AU', [{ id: 'EzdWsg7lDcA6n-AU', role: 'admin' }]);
});

app.use(vite.middlewares);
app.use(eStatic('static'));

server.listen(port, () => {
    console.log(`Robert's Rules Online listening at http://localhost:${port}`);
});
