import { nanoid } from 'nanoid';
import { MotionComment, MotionData, Sentiment } from '../../types';
import { findUserById } from '../controllers/users';
import { Database } from '../db';

const sql = Database.getInstance();

export class Motion {
    public readonly id: string;
    public readonly committeeId: string;
    public readonly authorId;
    public author?: string;
    public title: string;
    public flag: string;
    public description: string;
    public comments: MotionComment[];
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
        this.comments = typeof data.comments == 'string' ? (JSON.parse(data.comments) as MotionComment[]) : data.comments;
        this.vote = JSON.parse(data.vote || '{}');
        this.summary = data.summary;
        this.relatedId = data.relatedId;
        this.status = data.status;
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

    public setFlag = async (flag: string): Promise<void> => {
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

    public setSummary = async (summary: string): Promise<void> => {
        this.summary = summary;
        await sql.query(
            `
			UPDATE motions
			SET summary = ?
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [summary]
        );
    };

    public addVote = async (userId: string, value: string): Promise<void> => {
        this.vote[userId] = value;
        await sql.query(
            `
			UPDATE motions
			SET vote = JSON_SET(vote, '$.?', '?')
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [userId, value]
        );
    };

    public removeVote = async (userId: string): Promise<void> => {
        delete this.vote[userId];
        sql.query(
            await `
			UPDATE motions
			SET vote = JSON_REMOVE(vote, '$.?')
			WHERE id = '${this.id}' AND committeeId = '${this.committeeId}';
		`,
            [userId]
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

    public setStatus = async (status: string): Promise<void> => {
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
            content: comment || '',
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
