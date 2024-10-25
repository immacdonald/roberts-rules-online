interface CommitteeMember {
    username: string;
    displayname: string;
    role: string;
}

interface CommitteeData {
    id: string;
    name: string;
    description: string;
    owner: string;
    members: CommitteeMember[];
}

export type { CommitteeMember, CommitteeData };
