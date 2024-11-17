import { MotionData } from '../../types';
import { Database } from '../db';
const sql = Database.getInstance();

export class Motion {
    public readonly id: string;
    public readonly committeeId: string;
    public readonly authorId;
    public title: string;
    public flag: string;
    public description: string;
    public vote: Record<string, string>;
    public summary: string;
    public relatedId: string;
    public status: string;
    public decisionTime: number;
    public creationDate: number;

    constructor(data: MotionData) {
        this.id = data.id;
        this.committeeId = data.committeeId;
        this.authorId = data.authorId;
        this.title = data.title;
        this.flag = data.flag;
        this.description = data.description;
        this.vote = JSON.parse(data.vote || '{}');
        this.summary = data.summary;
        this.relatedId = data.relatedId;
        this.status = data.status;
        this.decisionTime = data.decisionTime;
        this.creationDate = data.creationDate;
    }

    public alterTitle(title: string): void {
        this.title = title;
        sql.query(
            `
			UPDATE motions
			SET title = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [title]
        );
    }

    public setFlag(flag: string): void {
        this.flag = flag;
        sql.query(
            `
			UPDATE motions
			SET flag = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [flag]
        );
    }

    public setDescription(description: string): void {
        this.description = description;
        sql.query(
            `
			UPDATE motions
			SET description = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [description]
        );
    }

    public setSummary(summary: string): void {
        this.summary = summary;
        sql.query(
            `
			UPDATE motions
			SET summary = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [summary]
        );
    }

    public addVote(userId: string, value: string): void {
        this.vote[userId] = value;
        sql.query(
            `
			UPDATE motions
			SET vote = JSON_SET(vote, '$.?', '?')
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [userId, value]
        );
    }

    public removeVote(userId: string): void {
        delete this.vote[userId];
        sql.query(
            `
			UPDATE motions
			SET vote = JSON_REMOVE(vote, '$.?')
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [userId]
        );
    }

    public attachMotion(relatedId: string): void {
        this.relatedId = relatedId;
        sql.query(
            `
			UPDATE motions
			SET relatedId = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [relatedId]
        );
    }

    public setStatus(status: string): void {
        this.status = status;
        sql.query(
            `
			UPDATE motions
			SET status = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [status]
        );
    }

    public setDecisionTime(decisionTime: number): void {
        this.decisionTime = decisionTime;
        sql.query(`
			UPDATE motions
			SET decisionTime = '${decisionTime}'
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`);
    }

    public delete(): void {
        sql.query(`
			DELETE FROM motions
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`);
    }
}
