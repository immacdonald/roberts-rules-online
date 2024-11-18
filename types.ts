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
};

type MotionData = {
    id: string;
    committeeId: string;
    authorId: string;
    author?: string;
    title: string;
    flag: string;
    description: string;
    comments: MotionComment[];
    vote: string;
    summary: string;
    relatedId: string;
    status: string;
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

export type { CommitteeMember, CommitteeData, CommitteeRole, MotionData, Sentiment, MotionComment, UserWithToken };
