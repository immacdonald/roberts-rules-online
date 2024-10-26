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
}

export type { CommitteeMember, CommitteeData };
