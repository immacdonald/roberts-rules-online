import { nanoid } from 'nanoid';
import { CommitteeData } from '../../types';
import { Database } from '../db';
import { Committee } from '../interfaces/committee';
import { User } from '../interfaces/user';
import * as Users from './users';

const sql = Database.getInstance();

sql.ready(async function () {
    const committees = await sql.query('SELECT * FROM committees');
    committees.forEach((committee: Committee) => {
        Committees.instance.committees.push(new Committee(committee.id, committee.name, committee.owner, committee.members));
    });

    console.log('Committees Database is ready');
});
export class Committees {
    public static instance: Committees = new Committees();
    public committees: Committee[] = [];

    private constructor() {
        this.committees = [];
    }

    public getCommitteeById(id: string): Committee | null {
        return this.committees.find((committee) => committee.id === id) ?? null;
    }

    public createCommittee(name: string, description: string, owner: string, members: { id: string; role: string }[]): void {
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
                            Committees.instance.committees[Committees.instance.committees.length] = new Committee(id, name, owner, memberData);
                        }
                    });
                }
            }
        });
    }

    public async populateCommitteeMembers(committees: CommitteeData[]): Promise<CommitteeData[]> {
        for (let i = 0; i < committees.length; i++) {
            for (let j = 0; j < committees[i].members.length; j++) {
                const user: User | null = await Users.findUserById(committees[i].members[j].id);

                if (user) {
                    committees[i].members[j].displayname = user.displayname;
                    committees[i].members[j].username = user.username;
                }
            }
        }

        return committees;
    }

    public static isUserInCommittee(userId: string, committeeId: string): boolean {
        const committee = Committees.instance.getCommitteeById(committeeId);
        if (committee) {
            return committee.isMember(userId);
        }
        return false;
    }
}
