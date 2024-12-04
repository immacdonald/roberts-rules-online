import { nanoid } from 'nanoid';
import { MotionComment, MotionData, MotionFlag, MotionStatus, MotionSummary, Sentiment, Vote } from '../../types';
import { cleanTextForDatabase } from '../../utility';
import { findUserById } from '../controllers/users';
import { Database } from '../db';

const sql = Database.getInstance();

export class Motion {
    public readonly id: string;
    public readonly committeeId: string;
    public readonly authorId;
    public author?: string;
    public title: string;
    public flag: MotionFlag;
    public description: string;
    public comments: MotionComment[];
    public vote: Record<string, Vote>;
    public summary: MotionSummary | null;
    public relatedId: string;
    public status: MotionStatus;
    public decisionTime: number;
    public creationDate: number;

    constructor(data: MotionData) {
        this.id = data.id;
        this.committeeId = data.committeeId;
        this.authorId = data.authorId;
        this.title = data.title;
        this.flag = data.flag?.length > 0 ? data.flag : '';
        this.description = data.description;
        this.comments = typeof data.comments == 'string' ? (JSON.parse(data.comments) as MotionComment[]) : data.comments;
        this.vote = typeof data.vote == 'string' ? (JSON.parse(data.vote) as Record<string, Vote>) : data.vote;
        this.summary = typeof data.summary == 'string' ? ((data.summary as string).length > 0 ? (JSON.parse(data.summary) as MotionSummary) : null) : data.summary;
        this.relatedId = data.relatedId;
        this.status = data.status == 'pending' ? 'open' : data.status;
        this.decisionTime = data.decisionTime;
        this.creationDate = data.creationDate;
    }

    public initializeAuthors = async (): Promise<void> => {
        // Set motion author
        const author = await findUserById(this.authorId);
        if (author) {
            this.author = author.displayname;
        }

        // Set comment authors
        this.comments = await Promise.all(
            this.comments.map(async (comment) => {
                const author = await findUserById(comment.authorId);
                if (author) {
                    return {
                        ...comment,
                        author: author.displayname
                    };
                }
                return comment;
            })
        );
    };

    public alterTitle = async (title: string): Promise<void> => {
        this.title = title;
        await sql.query(
            `
			UPDATE motions
			SET title = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [title]
        );
    };

    public setFlag = async (flag: MotionFlag): Promise<void> => {
        this.flag = flag;
        await sql.query(
            `
			UPDATE motions
			SET flag = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [flag]
        );
    };

    public setDescription = async (description: string): Promise<void> => {
        this.description = description;
        await sql.query(
            `
			UPDATE motions
			SET description = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [description]
        );
    };

    public setSummary = async (summary: MotionSummary): Promise<void> => {
        this.summary = summary;
        await sql.query(
            `
			UPDATE motions
			SET summary = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [JSON.stringify(summary)]
        );
    };

    public addVote = async (userId: string, value: Vote): Promise<void> => {
        this.vote[userId] = value;
        await sql.query(
            `
            UPDATE motions
            SET vote = JSON_SET(vote, ?, ?)
            WHERE id = ? AND committeeId = ?;
            `,
            [`$.${userId}`, value, this.id, this.committeeId]
        );
    };

    public removeVote = async (userId: string): Promise<void> => {
        delete this.vote[userId];
        await sql.query(
            `
            UPDATE motions
            SET vote = JSON_REMOVE(vote, ?)
            WHERE id = ? AND committeeId = ?;
            `,
            [`$.${userId}`, this.id, this.committeeId]
        );
    };

    public attachMotion = async (relatedId: string): Promise<void> => {
        this.relatedId = relatedId;
        await sql.query(
            `
			UPDATE motions
			SET relatedId = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [relatedId]
        );
    };

    public setStatus = async (status: MotionStatus): Promise<void> => {
        this.status = status;
        await sql.query(
            `
			UPDATE motions
			SET status = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [status]
        );
    };

    public setDecisionTime = async (decisionTime: number): Promise<void> => {
        this.decisionTime = decisionTime;
        console.log('Updated decision time to', decisionTime);
        await sql.query(`
			UPDATE motions
			SET decisionTime = '${decisionTime}'
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`);
    };

    public addComment = async (userId: string, sentiment: Sentiment, comment: string, parentCommentId?: string): Promise<void> => {
        let id: string = nanoid(16);
        while (this.comments.some((comment: MotionComment) => comment.id == id)) {
            id = nanoid(16);
        }

        const createdComment: MotionComment = {
            id,
            authorId: userId,
            sentiment,
            content: cleanTextForDatabase(comment || ''),
            creationDate: Date.now(),
            parentCommentId: parentCommentId || ''
        };

        const author = await findUserById(userId);
        if (author) {
            createdComment.author = author.displayname;
        }

        this.comments = [...this.comments, createdComment];

        const databaseComments = this.comments.map((comment: MotionComment) => {
            const commentCopy = { ...comment };
            delete commentCopy.author;
            return commentCopy;
        });

        await sql.query(
            `
			UPDATE motions
			SET comments = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [JSON.stringify(databaseComments)]
        );
    };

    public removeComment = async (commentId: string): Promise<void> => {
        this.comments = this.comments.filter((comment: MotionComment) => comment.id != commentId);

        const databaseComments = this.comments.map((comment: MotionComment) => {
            const commentCopy = { ...comment };
            delete commentCopy.author;
            return commentCopy;
        });

        await sql.query(
            `
			UPDATE motions
			SET comments = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [JSON.stringify(databaseComments)]
        );
    };
}
