import type { SocketExec } from '../../../types';
import { FC, FormEvent, useState } from 'react';
import { Page } from '../../components';
import { Modal } from '../../components/Modal';
import styles from './Committees.module.scss';
import { Committees } from '../../interfaces/Committees';

interface ViewCommitteesProps {
    socketExec: SocketExec;
}

const ViewCommittees: FC<ViewCommitteesProps> = ({ socketExec }) => {
	// Populating the committees
	const getCommittee = (key: string, name: string, details: string, members: string) => {
        console.log('Getting committee:', key, name, details, members)
		return (
			<div className={styles.committee} key={key}>
				<h3>{name}</h3>
				<p>
					{details ||
						'No description provided for this committee. Please contact the committee chair for more information.'}
				</p>
				<br />
				<div className={styles.committeeCardFooter}>
					<p>
						<b>Members:</b> {members || "No Members"}
					</p>
				</div>
			</div>
		);
	};

	const populateCommittees = () => {
        console.log('Populating committees');
		// loop through the committees from User.instance.committees
		let strx = [];
		let committees = Committees.instance.committees;
		for (let i = 0; i < committees.length; i++) {
			strx.push(getCommittee(committees[i].id, committees[i].name, committees[i].description, committees[i].getMemberString()));
		}

		return (
			<>
				{strx}
			</>
		);
	};

    User.instance.addOnLoginHook(function () {
        console.log('creating hook')
        Committees.instance.addHook(populateCommittees);
    })






    const [createModal, setCreateModal] = useState<boolean>(false);

    const [committeeName, setCommitteeName] = useState<string>('');
    const [committeeDesc, setCommitteeDesc] = useState<string>('');

    const createCommittee = (): void => {
        console.log('Create a new committeee');
        setCreateModal(true);
    };


    const handleCreateCommittee = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Creating new committee:', committeeName, committeeDesc);
        // Create the committee
        socketExec('createCommittee', committeeName, committeeDesc);
    };

    return (
        <>
            <Page>
                <section>
                    <header className={styles.committeeViewTitle}>
                        <h1>My Committees</h1>
                        <button data-button-type="primary" onClick={() => createCommittee()}>
                            Create New Committee +
                        </button>
                    </header>
                    <div className={styles.committeeList} id="committeeList">{populateCommittees()}</div>
                </section>
            </Page>
            {createModal && (
                <Modal>
                    <h2>Create New Committee</h2>
                    <form id="createCommittee" onSubmit={handleCreateCommittee}>
                        <fieldset>
                            <label htmlFor="committeeName">Committee Title</label>
                            <input type="text" name="committeeName" id="committeeName" required={true} onChange={(ev) => setCommitteeName(ev.target.value)} value={committeeName} />
                        </fieldset>
                        <fieldset>
                            <label htmlFor="password">Committee Description</label>
                            <input type="text" id="committeeDesc" required={true} onChange={(ev) => setCommitteeDesc(ev.target.value)} value={committeeDesc} />
                        </fieldset>
                        <div className={styles.actions}>
                            <button onClick={() => setCreateModal(false)}>Cancel</button>
                            <button type="submit" id="createButton" data-button-type="primary">
                                Create Committee
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

export { ViewCommittees };
