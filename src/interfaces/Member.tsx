
export class Member {
	public username: string;
	public displayname: string;
	public role: string;

	constructor(username: string, displayname: string, role: string) {
		this.username = username;
		this.displayname = displayname;
		this.role = role;
	}
}
