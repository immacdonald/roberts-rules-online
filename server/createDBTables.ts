import { MySQL } from './db';

const db = MySQL.getInstance();

async function createUsersTable(): Promise<void> {
    const exits = await db.query(`SHOW TABLES LIKE 'users'`);
    if (exits.length <= 0) {
        const res = await db.query(`
			CREATE TABLE IF NOT EXISTS users (
				id varchar(64) NOT NULL,
				username varchar(32) NOT NULL,
				email varchar(32) NOT NULL,
				password varchar(255) NOT NULL,
				displayname varchar(32) NOT NULL,
				creationDate bigint(32) NOT NULL
			) ENGINE=InnoDB DEFAULT CHARSET=latin1;
		`);
        if (res) {
            console.log(res);
            await db.query(`ALTER TABLE users ADD PRIMARY KEY (id), ADD UNIQUE KEY \`users\` (email), ADD KEY \`email\` (email), ADD KEY \`username\` (username)`);
        }
    }
}

function createDatabase(): void {
    db.ready(async function () {
        await createUsersTable();
    });
}

export { createDatabase };
