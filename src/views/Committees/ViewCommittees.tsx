import type { SocketExec } from '../../../types';
import { FC, FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Page } from '../../components';
import { Modal } from '../../components/Modal';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';
import styles from './Committees.module.scss';

interface ViewCommitteesProps {
    socketExec: SocketExec;
}

const ViewCommittees: FC<ViewCommitteesProps> = ({ socketExec }) => {
    const { isLoggedIn, committees } = useWebsiteContext();

    const navigate = useNavigate();

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    // Populating the committees
    const getCommittee = (key: string, name: string, details: string, members: string) => {
        console.log('Getting committee:', key, name, details, members)
        return (
            <div className={styles.committee} key={key} onClick={() => navigate('/committees/home')}>
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

    /*User.instance.addOnLoginHook(function () {
        console.log('creating hook')
        Committees.instance.addHook(populateCommittees);
    })*/

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
                    <div className={styles.committeeList} id="committeeList">
                        {committees.length > 0 ? committees.map((committee: any) => {
                            return getCommittee(committee.id, committee.name, committee.description, ""/*committee.getMemberString()*/)
                        }) : (
                            <p>Loading committees... this process can take up to 30 seconds.</p>
                        )}
                    </div>
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
