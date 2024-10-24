import { Committee } from "./Committee";

export class Committees {
	public static instance: Committees = new Committees();
	public committees: Committee[] = [];
	public hooks: Function[] = [];

	private constructor() {
		this.committees = [];
	}

	public setCommittees(committees: Object[]): void {
		this.committees = [];
		committees.forEach((committee) => {
			let newC = new Committee(committee.id, committee.name, committee.description, committee.members);
			this.committees.push(newC);
		});
		this.hooks.forEach((func) => {
			console.log('Running hook')
			func();
		});
	}
	public addHook(func: Function): void {
		console.log('Adding hook')
		this.hooks.push(func);
	}
}
