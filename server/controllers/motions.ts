import { Database } from '../db';
import { Motion } from '../interfaces/motion';

const sql = Database.getInstance();

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
};

export class Motions {
    public motions: Motion[] = [];
    public committeeId: string;
    constructor(committeeId: string) {
        this.committeeId = committeeId;
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

    public createLightweightMotion(committeeId: string, authorId: string, title: string): void {
        const id = Math.floor(Math.random() * 99999999);
        const creationDate = Date.now();
        if (!committeeId || !authorId || !title) return console.log('Missing required fields');

        console.log(`Inserting motion ('${id}', '${committeeId}', '${authorId}', '${title}', '', '', '', '', '', 'pending', ${creationDate}, ${creationDate})`);

        sql.query(`
            INSERT INTO motions (id, committeeId, authorId, title, flag, description, vote, summary, relatedId, status, decisionTime, creationDate) VALUES
            (${id}, '${committeeId}', '${authorId}', '${title}', '', '', '', '', '', 'pending', ${creationDate}, ${creationDate})
        `);
    }

    public async updateMotion(data: MotionData): Promise<Motion> {
        const motion = new Motion(data);
        // find the motion and remove it then push the new motion version
        const x = this.motions.findIndex((m) => m.id === motion.id);
        if (x) {
            this.motions[x] = motion;
        } else {
            this.motions.push(motion);
        }
        await sql.query(`
            UPDATE motions SET title = '${motion.title}', flag = '${motion.flag}', description = '${motion.description}', vote = '${motion.vote}', summary = '${motion.summary}', relatedId = '${motion.relatedId}', status = '${motion.status}', decisionTime = '${motion.decisionTime}', creationDate = '${motion.creationDate}'
            WHERE id = '${motion.id}' AND committeeId = '${this.committeeId}'
        `);
        return motion;
    }
    public async deleteMotion(id: string): Promise<void> {
        this.motions = this.motions.filter((motion) => motion.id !== id);
        await sql.query(`DELETE FROM motions WHERE id = '${id}' AND committeeId = '${this.committeeId}'`);
    }
}
