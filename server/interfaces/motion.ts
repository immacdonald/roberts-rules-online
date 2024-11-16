import { Database } from '../db';
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

    public alterTitle(_title: string): void {
        this.title = _title;
        sql.query(
            `
			UPDATE motions
			SET title = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [_title]
        );
    }

    public setFlag(_flag: string): void {
        this.flag = _flag;
        sql.query(
            `
			UPDATE motions
			SET flag = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [_flag]
        );
    }

    public setDescription(_description: string): void {
        this.description = _description;
        sql.query(
            `
			UPDATE motions
			SET description = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [_description]
        );
    }

    public setSummary(_summary: string): void {
        this.summary = _summary;
        sql.query(
            `
			UPDATE motions
			SET summary = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [_summary]
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

    public attachMotion(_relatedId: string): void {
        this.relatedId = _relatedId;
        sql.query(
            `
			UPDATE motions
			SET relatedId = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [_relatedId]
        );
    }
    /*
	public detachMotion(): void {
		this.relatedId = '';
		sql.query(`
			UPDATE motions
			SET relatedId = ''
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`)
	}*/

    public setStatus(_status: string): void {
        this.status = _status;
        sql.query(
            `
			UPDATE motions
			SET status = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [_status]
        );
    }

    public setDecisionTime(_decisionTime: number): void {
        this.decisionTime = _decisionTime;
        sql.query(`
			UPDATE motions
			SET decisionTime = '${_decisionTime}'
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
