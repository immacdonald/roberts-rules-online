import { Member } from './Member';

interface CommitteeMember {
	username: string;
	displayname: string;
	role: string;
}

export class Committee {
	public id: string;
	public name: string;
	public description: string;
	public members: Member[];

	constructor(id: string, name: string, description: string, members: CommitteeMember[]) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.members = [];
		members.forEach((member) => {
			const newM = new Member(member.username, member.displayname, member.role)
			this.members.push(newM);
		});
	}

	public getMemberString(): string {
		let str = '';
		for (let i = 0; i < this.members.length; i++) {
			str += this.members[i].displayname;
			if (i < this.members.length - 1) {
				str += ', ';
			}
		}
		return str;
	}
}
