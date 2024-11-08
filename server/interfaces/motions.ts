import { MySQL } from '../db';
import { Motion } from './motion';
import { Users as UsersClass } from './users';

const sql = MySQL.getInstance();
let dbReady = false;
let Users: UsersClass;

type MotionData = {
    id: string;
    committeeId: string;
    authorId: string;
    title: string;
    flag: string;
    description: string;
    vote: string;
    summary: string;
    relatedId: string;
    status: string;
    decisionTime: number;
    creationDate: number;
}

// function createMotion(committeeId, authorId, title) {
//     const id = nanoid(16);
//     const creationDate = Date.now();
//     if (!dbReady) return setTimeout(() => createMotion(committeeId, authorId, title), 1000);
//     if (!committeeId || !authorId || !title) return console.log('Missing required fields');
//
//     sql.query(`
//         INSERT INTO motions (id, committeeId, authorId, title, flag, description, vote, summary, relatedId, status, decisionTime, creationDate) VALUES
//         ('${id}', '${committeeId}', '${authorId}', '${title}', '', '', '', '', '', 'pending', ${creationDate}, ${creationDate})
//     `)
// }

sql.ready(async function () {
    dbReady = true;
    // createMotion('1', '1', 'Test Motion 1');
});

export class Motions {
    public static dbReady = dbReady;
    public motions: Motion[] = [];
    public committeeId: string;
    private dbready: boolean = false;
    constructor(committeeId: string) {
        this.committeeId = committeeId;
        this.dbready = dbReady;
    }

    public async getMotions(): Promise<Motion[]> {
        this.motions = [];
        const res = await sql.query(`SELECT * FROM motions WHERE committeeId = '${this.committeeId}'`);
        for (const motion of res) {
            this.motions.push(new Motion(motion));
        }
        return this.motions;
    }
    public async getMotion(id: string): Promise<Motion> {
        const res = await sql.query(`SELECT * FROM motions WHERE id = '${id} AND committeeId = '${this.committeeId}'`);
        return new Motion(res[0]);
    }
    public async createMotion(data: MotionData): Promise<Motion> {
        const motion = new Motion(data);
        this.motions.push(motion);
        await sql.query(`
            INSERT INTO motions (id, committeeId, authorId, title, flag, description, vote, summary, relatedId, status, decisionTime, creationDate)
            VALUES ('${motion.id}', '${motion.committeeId}', '${motion.authorId}', '${motion.title}', '${motion.flag}', '${motion.description}', '${motion.vote}', '${motion.summary}', '${motion.relatedId}', '${motion.status}', '${motion.decisionTime}', '${motion.creationDate}')
        `);
        return motion;
    }
    public async updateMotion(data: MotionData): Promise<Motion> {
        const motion = new Motion(data);
        // find the motion and remove it then push the new motion version
        let x = this.motions.findIndex(m => m.id === motion.id);
        if (x) {this.motions[x] = motion;} else {this.motions.push(motion);}
        await sql.query(`
            UPDATE motions SET title = '${motion.title}', flag = '${motion.flag}', description = '${motion.description}', vote = '${motion.vote}', summary = '${motion.summary}', relatedId = '${motion.relatedId}', status = '${motion.status}', decisionTime = '${motion.decisionTime}', creationDate = '${motion.creationDate}'
            WHERE id = '${motion.id}' AND committeeId = '${this.committeeId}'
        `);
        return motion;
    }
    public async deleteMotion(id: string): Promise<void> {
        this.motions = this.motions.filter(motion => motion.id !== id);
        await sql.query(`DELETE FROM motions WHERE id = '${id}' AND committeeId = '${this.committeeId}'`);
    }
}