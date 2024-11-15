import { createServer } from 'http';
import express, { Express, Request, Response, static as eStatic } from 'express';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import ViteExpress from 'vite-express';
import { Committees as CommitteesClass } from './server/controllers/Committees';
import { Motions } from './server/controllers/motions';
import { Users as UsersClass } from './server/controllers/users';
import { createDatabase } from './server/createDBTables';
import { Database } from './server/db';
import { CommitteeData, UserWithToken } from './types';

const SECRET_KEY = 'DEV_SECRET_KEY';

createDatabase();

const Users: UsersClass = UsersClass.instance;
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
                console.log('Rejecting request due to database disconnect');
                res.sendStatus(503);
            }
        }, 5000);
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
            res.status(500).json({ success: false, message: error });
        }
    } else {
        try {
            const response = await Users.getUserProfile(token);
            if (response) {
                res.status(200).json({ success: true, data: response });
            } else {
                res.status(401).json({ success: false, message: 'Invalid or expired token.' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error });
        }
    }
});

app.post(`${API}/signup`, async (req, res) => {
    const { username, email, password, displayname } = req.body;
    console.log(`Registering ${username} for ${email}`);

    const [validUsername, error] = Users.isUsernameValid(username);
    if (!validUsername) {
        res.status(500).json({ success: false, message: error });
        return false;
    }
    if (!Users.isEmailValid(email)) {
        res.status(400).json({ success: false, message: 'Email is not valid.' });
        return false;
    }
    if (!Users.isPasswordValid(password)) {
        res.status(400).json({ success: false, message: 'Password is not valid.' });
        return false;
    }
    if (!Users.isDisplayNameValid(displayname)) {
        res.status(400).json({ success: false, message: 'Display name is not valid.' });
        return false;
    }

    try {
        const [userCreated, response] = await Users.createUser(username, email, password, displayname);
        if (userCreated) {
            const data = response as UserWithToken;
            res.status(200).json({ success: true, data });
        } else {
            res.status(401).json({ success: false, message: response });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error });
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
            return next();
        } else if (!decoded) {
            console.log('Failed to decode token');
            return next();
        } else {
            const user = decoded as { username: string; id: string };
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

    const sql = Database.getInstance();

    socket.on('getCommittees', async () => {
        const id = socket.data.id;
        await sql.query("SELECT * FROM committees WHERE owner = ? OR JSON_EXISTS(members, CONCAT('$.', ?))", [id, id], async (err, res) => {
            if (!err) {
                const data: CommitteeData[] = res.map((row: any) => ({
                    ...row,
                    members: JSON.parse(row.members)
                }));

                const clientTable = await CommitteesClass.instance.populateCommitteeMembers(data);
                socket.emit('setCommittees', clientTable);
            } else {
                console.log(err);
            }
        });
    });

    socket.on("createCommittee", async (name: string, description: string) => {
        CommitteesClass.instance.createCommittee(name, description, socket.data.id, [{id: socket.data.id, role: "owner"}]);
    })

    socket.on('getMotions', async (committeeId) => {
        if (!committeeId) {
            return;
        }
        const thisCommittee = CommitteesClass.instance.getCommitteeById(committeeId);
        if (thisCommittee) {
            const motions = await thisCommittee.getMotions(false);
            //console.log("Got motions", motions);
            if (motions) {
                socket.emit('setMotions', motions);
            }
        } else {
            console.log('Committee not found');
            return socket.emit('setMotions', []);
        }
    });

    socket.on('createMotion', async (committeeId, title) => {
        if (!committeeId) {
            return;
        }

        const id = socket.data.id;
        const motion = new Motions(committeeId);

        motion.createLightweightMotion(committeeId, id, title);
    });
});

app.use(vite.middlewares);
app.use(eStatic('static'));

server.listen(port, () => {
    console.log(`Robert's Rules Online listening at http://localhost:${port}`);
});
