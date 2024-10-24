import type { SocketExec } from '../../../types';
import { FC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../../components';
import { Modal } from '../../components/Modal';
import styles from './Committees.module.scss';

interface ViewCommitteesProps {
    socketExec: SocketExec;
}

const ViewCommittees: FC<ViewCommitteesProps> = ({ socketExec }) => {
    const [createModal, setCreateModal] = useState<boolean>(false);

    const [committeeName, setCommitteeName] = useState<string>('');
    const [committeeDesc, setCommitteeDesc] = useState<string>('');

    const navigate = useNavigate();

    const createCommittee = (): void => {
        console.log('Create a new committeee');
        setCreateModal(true);
    };

    const getCommittee = (name: string, details?: string): JSX.Element => {
        return (
            <div className={styles.committee} onClick={() => navigate('/committees/home')}>
                <h3>{name}</h3>
                <p>
                    {details ||
                        'Description ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ....'}
                </p>
                <br />
                <div className={styles.committeeCardFooter}>
                    <p>
                        <b>Members:</b> Person 1, Person 2, Person 3, and 5 others...
                    </p>
                </div>
            </div>
        );
    };

    const populateCommittees = (): JSX.Element => {
        return (
            <>
                {getCommittee('Committee 1')}
                {getCommittee('Committee 2')}
                {getCommittee('Committee 3')}
                {getCommittee('Committee 4')}
            </>
        );
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
                    <div className={styles.committeeList}>{populateCommittees()}</div>
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
