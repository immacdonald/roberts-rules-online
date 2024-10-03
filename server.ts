import express, { Express, Request, Response, static as eStatic } from 'express';
import ViteExpress from 'vite-express';
import { createServer as createViteServer } from 'vite';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { createDatabase } from './server/createDBTables';
import { Users as UsersClass } from './server/interfaces/users';
import { User } from './server/interfaces/user';
createDatabase();
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

app.get(`${API}/test`, (req: Request, res: Response) => {
    // Sends test JSON data
    res.json([1, 2, 3, 4, 5]);
});

io.on('connection', (socket: Socket) => {
    console.log('a user connected');

    socket.on('chatMessage', (msg) => {
        console.log('message: ' + msg);
    });
    // login
    socket.on('login', (username, password) => {
        console.log('Logging in...');
        console.log(username);
        console.log(password);
        Users.loginUser(username, password).then((r) => {
            console.log(r);
            if (r instanceof User) {
                socket.emit('login', r.username, r.email, r.displayname);
                r.setSocket(socket);
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
    socket.emit('chatMessage', 'wow');
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
});

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

// ViteExpress.listen(app, port, () => {
//     console.log(`[server]: Server is running at http://localhost:${port}`);
// });
