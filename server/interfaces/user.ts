// import {MySQL} from '../db';
import * as bcrypt from 'bcrypt';
import { Socket } from 'socket.io';
import { MySQL } from '../db';
import {Committees as CommitteesClass} from "./Committees";
import {Users} from "./users";

const sql = new MySQL();
let dbReady = false;
const Committees: CommitteesClass = CommitteesClass.instance;
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
    public socket: Socket;

    private readonly password: string;

    constructor(id, username, email, password, displayname, creationDate) {
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

    public setSocket(socket: Socket):void {
		if (this.socket == null || this.socket !== socket) {
			console.log("Setting socket...");
			this.socket = socket;
			const self = this;

			this.socket.on("getCommittees", async () => {
				console.log('Requested getCommittees');
				await sql.query("SELECT * FROM committees WHERE owner = ? OR JSON_EXISTS(members, CONCAT('$.', ?))", [self.id, self.id], async (err, res) => {
                    console.log("Performed a query?")
					if (!err) {
						console.log("Got committees, getting client table...");
						const clientTable = await Committees.getClientCommitteesVersion(res);
						console.log("Got client table, sending to client...");
						self.socket.emit("setCommittees", clientTable);
					}
				});
			});
		}else {console.log("Socket already set or invalid");}
    }
}
