import { Database } from './db';

const db = Database.getInstance();

async function createUsersTable(): Promise<void> {
    const exists = await db.query(`SHOW TABLES LIKE 'users'`);
    if (exists.length <= 0) {
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

async function createMotionsTable(): Promise<void> {
    const exists = await db.query(`SHOW TABLES LIKE 'motions'`);
    if (exists.length <= 0) {
        const res = await db.query(`
			CREATE TABLE IF NOT EXISTS motions (
                id varchar(64) NOT NULL,
                committeeId varchar(32) NOT NULL,
                authorId varchar(32) NOT NULL,
                title longtext NOT NULL,
                flag longtext NOT NULL,
                description longtext NOT NULL,
                comments longtext NOT NULL,
                vote longtext NOT NULL,
                summary longtext NOT NULL,
                relatedId varchar(32) DEFAULT NULL,
                status varchar(16) NOT NULL,
                decisionTime bigint(20) NOT NULL,
                creationDate bigint(20) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
		`);
        if (res) {
            console.log(res);
            await db.query(`
                ALTER TABLE \`motions\`
                    ADD PRIMARY KEY (\`id\`),
                    ADD KEY \`committeeId\` (\`committeeId\`),
                    ADD KEY \`authorId\` (\`authorId\`);
            COMMIT;
            `);
        }
    }
}

const initializeDatabase = async (): Promise<Database> => {
    await db.ready(async () => {
        createUsersTable();
        createMotionsTable();
    });

    return db;
};

export { initializeDatabase };
