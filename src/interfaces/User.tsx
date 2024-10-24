import { Socket } from 'socket.io-client';
import { Committees } from './Committees';
import { MySocket } from './socket';

export class User {
	public isLoggedIn: boolean;
	public username: string | undefined;
	public email: string | undefined;
	public displayname: string | undefined;
	public socket: Socket;
	public onLoginHooks: Function[];
	public static instance: User = new User();

	private constructor() { // private constructor avoids direct instantiation
		this.socket = MySocket.instance.socket;
		this.isLoggedIn = false;
		this.onLoginHooks = [];
		this.socket.on('login', (username, email, displayname) => {
			console.log("User logged in!");
			this.isLoggedIn = true;
			this.username = username;
			this.email = email;
			this.displayname = displayname;
			this.onLoginHooks.forEach((func) => {
				func();
			});
			/*setTimeout(() => {
				this.socket.emit("getCommittees");
			}, 1000);*/
		});

		/*this.socket.on('setCommittees', (committees) => {
			console.log(committees);
			Committees.instance.setCommittees(committees);
		});*/

	}

	public setSocket(socket: Socket): void {
		this.socket = socket;
	}

	public addOnLoginHook(func: Function): void {
		this.onLoginHooks.push(func);
		if (this.isLoggedIn) {
			func();
		}
	}

	public static loginUser(username: string, password: string): Promise<User> {
		return new Promise((resolve, reject) => {
			User.instance.socket.emit('login', username, password);
		});
	}
}
