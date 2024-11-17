import { nanoid } from 'nanoid';
import { CommitteeData } from '../../types';
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
    queriedCommittees.forEach((committee: Committee) => {
        addToCache(new Committee(committee.id, committee.name, committee.owner, committee.members));
    });

    console.log('Committees Database is ready');
});

const createCommittee = (name: string, description: string, owner: string, members: { id: string; role: string }[]): void => {
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

const populateCommitteeMembers = async (committees: CommitteeData[]): Promise<CommitteeData[]> => {
    for (let i = 0; i < committees.length; i++) {
        for (let j = 0; j < committees[i].members.length; j++) {
            const user: User | null = await findUserById(committees[i].members[j].id);

            if (user) {
                committees[i].members[j].displayname = user.displayname;
                committees[i].members[j].username = user.username;
            }
        }
    }

    return committees;
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

export { createCommittee, populateCommitteeMembers, getCommitteeById, isUserInCommittee };
