import { nanoid } from 'nanoid';
import { MySQL } from '../db';
import { Committee } from './Committee';
import { User } from './user';
import { Users as UsersClass } from './users';

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

//const saltRounds = 10; // Typically a value between 10 and 12

const sql = new MySQL();

let dbReady = false;
let Users: UsersClass;

sql.ready(async function () {
    Users = UsersClass.instance;
    dbReady = true;
    Committees.dbReady = dbReady;
    console.log('Committees Database is ready');
    sql.query('SELECT * FROM committees', (err, res) => {
        if (!err) {
            for (let i = 0; i < res.length; i++) {
                Committees.instance.committees.push(new Committee(res[i].id, res[i].name, res[i].owner, res[i].members));
            }
        }
    });
});
export class Committees {
    public static instance: Committees = new Committees();
    public static dbReady = dbReady;
    public committees: Committee[] = [];

    private constructor() {
        this.committees = [];
    }

    public createCommittee(name: string, description: string, owner: string, members: string): void {
        if (dbReady) {
            const id = nanoid(16);
            sql.query('SELECT * FROM committees WHERE id = ?', [id], (err, res) => {
                if (!err) {
                    if (res.length > 0) {
                        console.log('ID already exists');
                        //createCommittee(name, description, owner, members);
                    } else {
                        console.log('Creating committee: ', name, owner, members);
                        sql.query('INSERT INTO committees (id, name, description, owner, members) VALUES (?, ?, ?, ?, ?)', [id, name, description, owner, members], (err) => {
                            if (!err) {
                                Committees.instance.committees[Committees.instance.committees.length] = new Committee(id, name, owner, members);
                            }
                        });
                    }
                }
            });
        } else {
            setTimeout(() => {
                //createCommittee(name, description, owner, members);
            }, 1000);
        }
    }

    public async getClientCommitteesVersion(committees): Promise<CommitteeData[]> {
        const clientCommittees: CommitteeData[] = [];
        for (let i = 0; i < committees.length; i++) {
            clientCommittees.push(await this.getClientCommittee(committees[i]));
        }

        return clientCommittees;
    }

    public async getClientCommittee(committee): Promise<CommitteeData> {
        const members: CommitteeMember[] = [];
        for (const i in committee.members) {
            let user: User | undefined | null = Users.findUserById(i);
            if (!user) {
                user = await Users.getUserById(i);
            }

            if (user) {
                members.push({
                    username: user.username,
                    displayname: user.displayname,
                    role: committee.members[i].role
                });
            }
        }

        return {
            id: committee.id,
            name: committee.name,
            description: committee.description,
            owner: committee.owner,
            members: members
        } as CommitteeData;
    }

    public static setUsersClass(): void {
        Users = UsersClass.instance;
    }
}
