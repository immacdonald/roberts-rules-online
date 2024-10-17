import { Socket } from 'socket.io-client';
import { MySocket } from './socket';
import { Committees } from './Committees';

export class User {
	public isLoggedIn: boolean;
	public username: string;
	public email: string;
	public displayname: string;
	public socket: Socket;
	public static instance: User = new User();

	private constructor() { // private constructor avoids direct instantiation
		this.socket = MySocket.instance.socket;
		this.isLoggedIn = false;
		this.socket.on('login', (username, email, displayname) => {
			console.log("User logged in!");
			this.isLoggedIn = true;
			this.username = username;
			this.email = email;
			this.displayname = displayname;
			setTimeout(() => {
				this.socket.emit("getCommittees");
			}, 1000);
		});

		this.socket.on('setCommittees', (committees) => {
			console.log(committees);
			Committees.instance.setCommittees(committees);
		});

	}

	public setSocket(socket: Socket): void {
		this.socket = socket;
	}

	public static loginUser(username: string, password: string): Promise<User> {
		return new Promise((resolve, reject) => {
			User.instance.socket.emit('login', username, password);

		});
	}
}
