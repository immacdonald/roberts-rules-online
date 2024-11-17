import { User } from './server/interfaces/user';

type CommitteeRole = 'owner' | 'chair' | 'member' | 'observer';

interface CommitteeMember {
    id: string;
    role: CommitteeRole;
    username?: string;
    displayname?: string;
}

interface CommitteeData {
    id: string;
    name: string;
    description: string;
    owner: string;
    members: CommitteeMember[];
    motions: MotionData[] | null;
}

type MotionData = {
    id: string;
    committeeId: string;
    authorId: string;
    authorUsername?: string;
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

interface UserWithToken {
    user: User;
    token: string;
}

export type { CommitteeMember, CommitteeData, CommitteeRole, MotionData, UserWithToken };
