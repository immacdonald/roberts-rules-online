import { Member } from './Member';

export class Committee {
	public name: string;
	public description: string;
	public members: Member[];

	constructor(name: string, description: string, members: string[{username: string, displayname: string, role: string}]) {
		this.name = name;
		this.description = description;
		this.members = [];
		members.forEach((member) => {
			let newM = new Member(member.username, member.displayname, member.role)
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
