import express, { Express, Request, Response, static as eStatic } from 'express';
import ViteExpress from 'vite-express';
import { createServer as createViteServer } from 'vite';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import express, { Express, Request, Response, static as eStatic } from 'express';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import ViteExpress from 'vite-express';
import { createDatabase } from './server/createDBTables';
import { User } from './server/interfaces/user';

createDatabase();

const SECRET_KEY = 'DEV_SECRET_KEY';

const Users: UsersClass = new UsersClass();

const app: Express = express();
const server = createServer(app);
const port: number = 3000;
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000'
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

app.use(vite.middlewares);
app.use(eStatic('static'));

const API = '/api/v1';
app.get(`${API}/ping`, (_: Request, res: Response) => {
    // Sends a friendly message and a 200 status (implicitly)
    res.send('Hello, this is the Express API.');
});

io.use((socket, next) => {
    const token = socket.handshake.query.token;

    // Proceed normally if no token is provided
    if (!token) {
        console.log('No token provided, allowing anonymous connection');
        return next();
    }

    // Verify the token if it is present
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log('Failed to authenticate token:', err.message);
            return next(new Error('Authentication error'));
        }
        console.log(`Successfully authenticated user ${decoded.email} from JWT`);
        socket.emit('login', { id: decoded.id, displayname: decoded.displayname, username: decoded.username, email: decoded.email }, token);
        next();
    });
});

io.on('connection', (socket: Socket) => {
    console.log('Client is connected');

    socket.on('chatMessage', (msg) => {
        console.log('message: ' + msg);
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

        if (!Users.isUsernameValid(username)) {
            socket.emit('failedRegister', 'Username is not valid.');
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
            .then((r) => {
                console.log(r);
            })
            .catch((e) => {
                console.log(e);
            });
    });
});

Users.dbReady(async () => {
    console.log('Users Database is ready');
    Users.createUser('PeterG', 'peter@localhost.local', 'AdminPassword', 'Peter G')
        .then((r) => {
            console.log(r);
        })
        .catch((e) => {
            console.log(e);
        });
    Users.createUser('test', 'test@example.com', 'password', 'Admin')
        .then((r) => {
            console.log(r);
        })
        .catch((e) => {
            console.log(e);
        });
});

server.listen(port, () => {
    console.log(`Robert's Rules Online listening at http://localhost:${port}`);
});

// ViteExpress.listen(app, port, () => {
//     console.log(`[server]: Server is running at http://localhost:${port}`);
// });
