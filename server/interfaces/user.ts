import { compare } from 'bcrypt';
export class User {
    public readonly id: string;
    public username: string;
    public displayname: string;
    public readonly email: string;
    public creationDate: number;

    private readonly password: string;

    constructor(id: any, username: any, email: any, password: any, displayname: any, creationDate: any) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.displayname = displayname;
        this.creationDate = creationDate;
    }

    public async isPasswordCorrect(password: string): Promise<boolean> {
        return await compare(password, this.password);
    }
}
