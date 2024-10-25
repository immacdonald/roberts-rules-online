import { CommitteeMember } from '../types';

const getMembersString = (members: CommitteeMember[]): string => {
    let str = '';
    for (let i = 0; i < members.length; i++) {
        str += members[i].displayname;
        if (i < members.length - 1) {
            str += ', ';
        }
    }
    return str;
};

export { getMembersString };
