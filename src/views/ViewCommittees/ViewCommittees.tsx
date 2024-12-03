import { FC, FormEvent, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CommitteeData } from 'types';
import { Page } from '../../components';
import { Modal } from '../../components/Modal';
import { selectCommittees } from '../../features/committeesSlice';
import { socket } from '../../socket';
import styles from './ViewCommittees.module.scss';

const ViewCommittees: FC = () => {
    const committees = useSelector(selectCommittees);

    const [createModal, setCreateModal] = useState<boolean>(false);

    const [committeeName, setCommitteeName] = useState<string>('');
    const [committeeDesc, setCommitteeDesc] = useState<string>('');

    const navigate = useNavigate();

    const createCommittee = (): void => {
        //console.log('Create a new committeee');
        setCreateModal(true);
    };

    const handleCreateCommittee = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Creating new committee:', committeeName, committeeDesc);
        // Create the committee
        socket!.emit('createCommittee', committeeName, committeeDesc);
        setCreateModal(false);
    };

    return (
        <>
            <Page>
                <Helmet>
                    <title>My Committees - Robert's Rules</title>
                </Helmet>
                <section>
                    <header className={styles.committeeViewTitle}>
                        <h1>My Committees</h1>
                        <button data-button-type="primary" onClick={() => createCommittee()}>
                            Create New Committee +
                        </button>
                    </header>
                    {committees ? (
                        <div className={styles.committeeList} id="committeeList">
                            {committees.map((committee: CommitteeData) => {
                                return (
                                    <div className={styles.committee} key={committee.id} onClick={() => navigate(`/committees/${committee.id}/home`)}>
                                        <div className={styles.committeeHeader}>
                                            <h3>{committee.name}</h3>
                                        </div>
                                        <p>{committee.description || 'No description provided for this committee. Please contact the committee chair for more information.'}</p>
                                        <br />
                                        <div className={styles.committeeCardFooter}>
                                            <p>
                                                <b>Members: </b>
                                                {committee.members && committee.members.length > 0 ? committee.members.map((member) => member.displayname || member.id).join(', ') : 'No Members'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p>Unable to load committees, please reload and try again.</p>
                    )}
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
                        <Modal.Actions>
                            <button type="button" onClick={() => setCreateModal(false)} data-button-type="secondary">
                                Cancel
                            </button>
                            <button type="submit" id="createButton" data-button-type="primary">
                                Create Committee
                            </button>
                        </Modal.Actions>
                    </form>
                </Modal>
            )}
        </>
    );
};

export { ViewCommittees };
