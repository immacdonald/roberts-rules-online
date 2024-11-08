import { MotionData } from '../../types';

export class Motion {
    public readonly id: string;
    public readonly committeeId: string;
    public readonly authorId
    public title: string;
    public flag: string;
    public description: string;
    public vote: string;
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
        this.vote = data.vote;
        this.summary = data.summary;
        this.relatedId = data.relatedId;
        this.status = data.status;
        this.decisionTime = data.decisionTime;
        this.creationDate = data.creationDate;
    }
}
