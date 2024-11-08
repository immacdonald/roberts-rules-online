interface CommitteeMember {
    id: string;
    role: string;
    username?: string;
    displayname?: string;
}

interface CommitteeData {
    id: string;
    name: string;
    description: string;
    owner: string;
    members: CommitteeMember[];
    motions: MotionData[]
}

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

export type { CommitteeMember, CommitteeData, MotionData };
