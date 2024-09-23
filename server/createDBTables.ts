import { MySQL } from './db';
const db = new MySQL();

async function createUsersTable() {
    const res = await db.query(`
		CREATE TABLE IF NOT EXISTS 'users' (
			'id' varchar(64) NOT NULL,
			'username' varchar(32) NOT NULL,
			'email' varchar(32) NOT NULL,
			'password' varchar(255) NOT NULL,
			'displayname' varchar(32) NOT NULL,
			'creationDate' int(11) NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	`);
    if (res) {
        console.log(res);
        await db.query(`
			ALTER TABLE 'users'
			  ADD PRIMARY KEY ('id'),
			  ADD UNIQUE KEY 'email_2' ('email'),
			  ADD KEY 'email' ('email'),
			  ADD KEY 'username' ('username');
			COMMIT;
		`);
    }
}

function createDatabase() {
    db.ready(async function () {
        await createUsersTable();
    });
}

export { createDatabase };
