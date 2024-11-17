import { createServer } from 'http';
import express, { Express } from 'express';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import ViteExpress from 'vite-express';
import { createDatabase } from './server/createDBTables';
import { apiRoutes, setupSocketHandlers } from './server/routes';

const port = 3000;
const app: Express = express();
app.use(express.json());

// Initialize database
const database = await createDatabase();

// Middleware to block any requests made before the database is connected
app.use((_, res, next) => {
    if (!database.initialized) {
        setTimeout(() => {
            if (!database.initialized) {
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

// Add API routes
app.use('/api/v1', apiRoutes);

const server = createServer(app);
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

app.use(vite.middlewares);
app.use(express.static('static'));

setupSocketHandlers(io);

server.listen(port, () => {
    console.log(`Robert's Rules Online listening at http://localhost:${port}`);
});
