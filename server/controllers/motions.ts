import { MotionData } from '../../types';
import { cleanTextForDatabase } from '../../utility';
import { Database } from '../db';
import { Motion } from '../interfaces/motion';

const sql = Database.getInstance();

export class Motions {
    private loadedMotions: boolean;
    public motions: Motion[] = [];
    public readonly committeeId: string;

    constructor(committeeId: string) {
        this.committeeId = committeeId;
        this.loadedMotions = false;
    }

    public async loadMotions(): Promise<Motion[]> {
        this.motions = [];
        const res = await sql.query(`SELECT * FROM motions WHERE committeeId = '${this.committeeId}'`);

        for (const motion of res) {
            const createdMotion = new Motion(motion);
            await createdMotion.initializeAuthors();
            this.motions.push(createdMotion);
        }

        this.loadedMotions = true;
        return this.motions;
    }

    public getMotions = async (): Promise<Motion[]> => {
        if (this.loadedMotions) {
            return this.motions;
        } else {
            return await this.loadMotions();
        }
    };

    public async findMotion(id: string): Promise<Motion | null> {
        if (!this.loadedMotions) {
            await this.loadMotions();
        }

        return this.motions.find((motion: Motion) => motion.id == id) ?? null;
    }

    public async createMotion(data: MotionData): Promise<Motion> {
        const motion = new Motion(data);
        await motion.initializeAuthors();
        this.motions.push(motion);

        await sql.query(`
            INSERT INTO motions (id, committeeId, authorId, title, flag, description, comments, vote, summary, relatedId, status, decisionTime, creationDate)
            VALUES ('${data.id}', '${data.committeeId}', '${data.authorId}', '${cleanTextForDatabase(data.title)}', '${data.flag}', '${cleanTextForDatabase(data.description)}', '${JSON.stringify(data.comments)}', '${JSON.stringify(data.vote)}', '${data.summary}', '${data.relatedId}', '${data.status}', '${data.decisionTime}', '${data.creationDate}')
        `);
        return motion;
    }

    public async deleteMotion(id: string): Promise<void> {
        this.motions = this.motions.filter((motion) => motion.id != id);
        await sql.query(`DELETE FROM motions WHERE id = '${id}' AND committeeId = '${this.committeeId}'`);
    }
}
