import 'dotenv/config';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { Express } from 'express';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { apiRoutes, setupSocketHandlers } from './server/routes';
import { serverConfig } from './server/server-config';
import { initializeDatabase } from './server/validate-database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set VITE_ environment variables dynamically to match server values
if (!process.env.PORT) {
    process.env.PORT = '3000';
}
if (!process.env.PRODUCTION_URL) {
    process.env.PRODUCTION_URL = 'roberts-rules-online.onrender.com';
}
if (!process.env.VITE_PORT) {
    process.env.VITE_PORT = process.env.PORT;
}

if (!process.env.VITE_PRODUCTION_URL) {
    process.env.VITE_PRODUCTION_URL = process.env.PRODUCTION_URL;
}

const app: Express = express();
app.use(express.json());

// Initialize database (creates if needed)
const database = await initializeDatabase();

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
const origin = serverConfig.url;
const io = new Server(server, {
    cors: {
        origin
    }
});

if (serverConfig.production) {
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

server.listen(serverConfig.port, () => {
    console.log(`Robert's Rules Online listening at ${origin}`);
});
