import * as bcrypt from 'bcrypt';
import { Socket } from 'socket.io';
import { CommitteeData } from '../../types';
import { MySQL } from '../db';
import { Committees as CommitteesClass } from './Committees';

const sql = MySQL.getInstance();
let dbReady = false;

sql.ready(async function () {
    dbReady = true;
    User.dbReady = dbReady;
});

export class User {
    public static dbReady: boolean = dbReady;
    public readonly id: string;
    public username: string;
    public displayname: string;
    public readonly email: string;
    public creationDate: number;
    // @ts-expect-error not set in constructor
    public socket: Socket;

    private readonly password: string;

    constructor(id: any, username: any, email: any, password: any, displayname: any, creationDate: any) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.displayname = displayname;
        this.creationDate = creationDate;
    }

    public async isPasswordCorrect(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    public setSocket(socket: Socket): void {
        if (this.socket == null || this.socket !== socket) {
            this.socket = socket;

            const Committees: CommitteesClass = CommitteesClass.instance;

            this.socket.on('getCommittees', async () => {
                await sql.query("SELECT * FROM committees WHERE owner = ? OR JSON_EXISTS(members, CONCAT('$.', ?))", [this.id, this.id], async (err, res) => {
                    if (!err) {
                        //const data = JSON.parse(JSON.stringify(res));
                        const data: CommitteeData[] = res.map((row: any) => ({
                            ...row,
                            members: JSON.parse(row.members)
                        }));

                        const clientTable = await Committees.populateCommitteeMembers(data);
                        this.socket.emit('setCommittees', clientTable);
                        //this.socket.emit('setCommittees', data);
                    }
                });
            });

            this.socket.on('getMotions', async (committeeId) => {
                if (!committeeId) {
                    return;
                }
                let thisCommittee = Committees.getCommitteeById(committeeId);
                if (thisCommittee) {
                    let motions = await thisCommittee.getMotions(true);
                    if (motions) {
                        console.log('Motions were sent to all clients');
                    }
                }else {
                    console.log('Committee not found');
                    return this.socket.emit('setMotions', []);
                }
            });
        } else {
            console.log('Socket already set or invalid');
        }
    }
}
