import { nanoid } from 'nanoid';
import { CommitteeData } from '../../types';
import { MySQL } from '../db';
import { Motion } from './motion';
import { User } from './user';
import { Users as UsersClass } from './users';
import {Committee} from "./Committee";

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
    private dbReady: boolean = false;
	private readonly committee: Committee;
	private inUpdate: Promise<void>;

    constructor(committeeId: string, _committee: Committee) {
        this.committeeId = committeeId;
        this.dbReady = dbReady;
		this.committee = _committee;
    }

	public async getMotions(): Promise<Motion[]> {
		if (!this.inUpdate) {
			this.inUpdate = (async () => {
				try {
					const res = await sql.query(`SELECT * FROM motions WHERE committeeId = ?`, [this.committeeId]);
					this.motions = [];
					for (const motion of res) {
						this.motions.push(new Motion(motion, this.committee));
					}
				} finally {
					this.inUpdate = null;
				}
			})();
		}

		await this.inUpdate;
		return this.motions;
	}

	public async getMotion(id: string): Promise<Motion> {
        const res = await sql.query(`SELECT * FROM motions WHERE id = '${id} AND committeeId = '${this.committeeId}'`);
        return new Motion(res[0], this.committee);
    }

	public findMotion(id: string): Motion | undefined {
		return this.motions.find(motion => motion.id === id);
	}

    public async createMotion(data: MotionData): Promise<Motion> {
        const motion = new Motion(data, this.committee);
        this.motions.push(motion);
        await sql.query(`
            INSERT INTO motions (id, committeeId, authorId, title, flag, description, vote, summary, relatedId, status, decisionTime, creationDate)
            VALUES ('${data.id}', '${data.committeeId}', '${data.authorId}', '${data.title}', '${data.flag}', '${data.description}', '${data.vote}', '${data.summary}', '${data.relatedId}', '${data.status}', '${data.decisionTime}', '${data.creationDate}')
        `);
        return motion;
    }
    public async updateMotion(data: MotionData): Promise<Motion> {
        const motion = new Motion(data, this.committee);
        // find the motion and remove it then push the new motion version
        const index = this.motions.findIndex(m => m.id === motion.id);
        if (index) {this.motions[index] = motion;} else {this.motions.push(motion);}
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
