import { nanoid } from 'nanoid';
import { CommitteeMember, CommitteeRole } from '../../types';
import { Database } from '../db';
import { Committee } from '../interfaces/committee';
import { User } from '../interfaces/user';
import { findUserById } from './users';

const sql = Database.getInstance();

const committees: Committee[] = [];

const addToCache = (committee: Committee): void => {
    committees.push(committee);
};

sql.ready(async function () {
    // Build the initial cache of committees
    const queriedCommittees = await sql.query('SELECT * FROM committees');
    queriedCommittees.forEach(async (committee: Committee) => {
        const newCommittee = new Committee(committee.id, committee.name, committee.owner, committee.members);
        for (let j = 0; j < newCommittee.members.length; j++) {
            const user: User | null = await findUserById(newCommittee.members[j].id);

            if (user) {
                newCommittee.members[j].displayname = user.displayname;
                newCommittee.members[j].username = user.username;
            }
        }
        addToCache(newCommittee);
    });

    console.log('Committees Database is ready');
});

const createCommittee = (name: string, description: string, owner: string, members: { id: string; role: CommitteeRole }[]): void => {
    const id = nanoid(16);

    const memberData = JSON.stringify(members);

    sql.query('SELECT * FROM committees WHERE id = ?', [id], (err, res) => {
        if (!err) {
            if (res.length > 0) {
                console.log('ID already exists');
            } else {
                console.log('Creating committee: ', name, owner, members);
                sql.query('INSERT INTO committees (id, name, description, owner, members) VALUES (?, ?, ?, ?, ?)', [id, name, description, owner, memberData], (err) => {
                    if (!err) {
                        addToCache(new Committee(id, name, owner, memberData));
                    }
                });
            }
        }
    });
};

const getCommitteesForUser = (userId: string): Committee[] => {
    return committees.filter((committee: Committee) => committee.members.some((member: CommitteeMember) => member.id == userId));
};

const getCommitteeById = (id: string): Committee | null => {
    return committees.find((committee) => committee.id === id) ?? null;
};

const isUserInCommittee = (userId: string, committeeId: string): boolean => {
    const committee = getCommitteeById(committeeId);
    if (committee) {
        return committee.isMember(userId);
    }
    return false;
};

export { createCommittee, getCommitteesForUser, getCommitteeById, isUserInCommittee };
