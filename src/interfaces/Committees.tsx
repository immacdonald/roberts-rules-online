import { Committee } from "./Committee";

export class Committees {
	public static instance: Committees = new Committees();
	public committees: Committee[] = [];

	private constructor() {
		this.committees = [];
	}

	public setCommittees(committees: Object[]): void {
		this.committees = [];
		committees.forEach((committee) => {
			let newC = new Committee(committee.name, committee.description, committee.members);
			this.committees.push(newC);
		});
	}
}
