import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { MySQL } from '../db';

export class Committee {
	public readonly id: string;
	public name: string;
	public description: string;
	public owner: string;
	public members: Object;

	constructor(id, name, owner, members) {
		this.id = id;
		this.name = name;
		this.owner = owner;
		this.members = JSON.parse(members);
	}
}
