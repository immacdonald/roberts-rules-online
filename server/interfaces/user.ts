// import {MySQL} from '../db';
import * as bcrypt from 'bcrypt';
// const saltRounds = 10; // Typically a value between 10 and 12

export class User {
    public readonly id: string;
    public username: string;
    public displayname: string;
    public readonly email: string;

    private readonly password: string;
    private creationDate: number;

    constructor(id, username, email, password, displayname, creationDate) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.displayname = displayname;
        this.creationDate = creationDate;
    }

    async isPasswordCorrect(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}
