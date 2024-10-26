import { nanoid } from 'nanoid';
import { CommitteeData } from '../../types';
import { MySQL } from '../db';
import { Committee } from './Committee';
import { User } from './user';
import { Users as UsersClass } from './users';

//const saltRounds = 10; // Typically a value between 10 and 12

const sql = MySQL.getInstance();

let dbReady = false;
let Users: UsersClass;

sql.ready(async function () {
    dbReady = true;
    Committees.dbReady = dbReady;

    // Example Committees setup
    const committees = await sql.query('SELECT * FROM committees');
    committees.forEach((committee) => {
        Committees.instance.committees.push(new Committee(committee.id, committee.name, committee.owner, committee.members));
    });

    console.log('Committees Database is ready');
});
export class Committees {
    public static instance: Committees = new Committees();
    public static dbReady = dbReady;
    public committees: Committee[] = [];

    private constructor() {
        this.committees = [];
    }

    public createCommittee(name: string, description: string, owner: string, members: { id: string; role: string }[]): void {
        if (dbReady) {
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
        } else {
            setTimeout(() => {
                this.createCommittee(name, description, owner, members);
            }, 1000);
        }
    }

    public async populateCommitteeMembers(committees: CommitteeData[]): Promise<CommitteeData[]> {
        for (let i = 0; i < committees.length; i++) {
            for (let j = 0; j < committees[i].members.length; j++) {
                let user: User | undefined | null = Users.findUserById(committees[i].members[j].id);
                if (!user) {
                    user = await Users.getUserById(committees[i].members[j].id);
                }

                if (user) {
                    committees[i].members[j].displayname = user.displayname;
                    committees[i].members[j].username = user.username;
                }
            }
        }

        return committees;
    }

    public static setUsersClass(): void {
        Users = UsersClass.instance;
    }
}
