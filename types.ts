import { User } from './server/interfaces/user';

type CommitteeRole = 'owner' | 'chair' | 'member' | 'observer';

type CommitteeMember = {
    id: string;
    role: CommitteeRole;
    username?: string;
    displayname?: string;
};

type CommitteeData = {
    id: string;
    name: string;
    description: string;
    owner: string;
    members: CommitteeMember[];
    motions: MotionData[] | null;
    flag: string | null;
};

type Vote = 'yea' | 'nay' | 'abstain';

type MotionStatus = 'pending' | 'open' | 'complete' | 'passed' | 'failed';

type MotionFlag = '' | 'special' | 'procedural' | 'amendment' | 'overturn';

type MotionSummary = {
    summary: string;
    pros: string;
    cons: string;
};

type MotionData = {
    id: string;
    committeeId: string;
    authorId: string;
    author?: string;
    title: string;
    flag: MotionFlag;
    description: string;
    comments: MotionComment[];
    vote: Record<string, Vote>;
    summary: MotionSummary | null;
    relatedId: string;
    status: MotionStatus;
    decisionTime: number;
    creationDate: number;
};

type Sentiment = 'positive' | 'negative' | 'neutral';

type MotionComment = {
    id: string;
    authorId: string;
    author?: string;
    sentiment: Sentiment;
    content: string;
    parentCommentId?: string;
    creationDate: number;
};

type UserWithToken = {
    user: User;
    token: string;
};

export type { CommitteeMember, CommitteeData, CommitteeRole, Vote, MotionStatus, MotionSummary, MotionFlag, MotionData, Sentiment, MotionComment, UserWithToken };
