import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { Express } from 'express';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { createDatabase } from './server/createDBTables';
import { apiRoutes, setupSocketHandlers } from './server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;
const app: Express = express();
app.use(express.json());

// Determine environment to set CORS origin
const production = process.env.NODE_ENV == 'production';
const origin = production ? 'https://robert-rules-online.onrender.com' : `http://localhost:${port}`;

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
        origin
    }
});

if (production) {
    // Serve static files from the "dist" directory
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    // Serve the SPA index.html for unmatched routes
    app.get('*', (_, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // Vite middleware for development
    const vite = await createViteServer({
        server: { middlewareMode: true }
    });

    app.use(vite.middlewares);
}

// Socket.IO setup
setupSocketHandlers(io);

server.listen(port, () => {
    console.log(`Robert's Rules Online listening at ${origin}`);
});
