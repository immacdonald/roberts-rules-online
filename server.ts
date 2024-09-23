import express, {Express, Request, Response} from 'express';
import ViteExpress from 'vite-express';
import {createDatabase} from './server/createDBTables';
createDatabase();

const app: Express = express();
const port: number = 3000;

const API = '/api/v1';

app.get(`${API}/ping`, (_: Request, res: Response) => {
    // Sends a friendly message and a 200 status (implicitly)
    res.send('Hello, this is the Express API.');
});

app.get(`${API}/test`, (req: Request, res: Response) => {
    // Sends test JSON data
    res.json([1, 2, 3, 4, 5]);
});

ViteExpress.listen(app, port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
