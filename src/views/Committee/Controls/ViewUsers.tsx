import { FC, useState, FormEvent, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { CommitteeMember } from 'types';
import { ChairIcon, HomeIcon } from '../../../assets/icons';
import { Loading } from '../../../components';
import { Modal } from '../../../components/Modal';
import { selectCurrentCommittee } from '../../../features/committeesSlice';
import styles from './ViewUsers.module.scss';

const CommitteeViewUsers: FC = () => {
    const { members } = useSelector(selectCurrentCommittee)!;

    const [createModal, setCreateModal] = useState<boolean>(false);
    const [newUserName, setUserName] = useState<string>('');

    const promoteUser = (userId: string): void => {
        console.log('Promoting user:', userId);
    };

    const addUser = (): void => {
        console.log('Adding new user');
        setCreateModal(true);
    };

    const handleAddUser = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Adding new user:', newUserName);
        // Add the new user

        //socket.emit('addUser', newUserName);
    };

    const getUser = (name: string, role: string, userId: string): ReactElement => {
        const getRoleBox = (role: string, userId: string): ReactElement => {
            if (role === 'owner') {
                return (
                    <div className={styles.role}>
                        <b>Owner</b>
                        <HomeIcon />
                    </div>
                );
            } else if (role === 'chair') {
                return (
                    <div className={styles.role}>
                        <b>Chair</b>
                        <ChairIcon />
                    </div>
                );
            } else {
                return (
                    <div className={styles.role}>
                        <b>Member</b>
                        <button onClick={() => promoteUser(userId)} disabled>
                            Promote
                        </button>
                    </div>
                );
            }
        };

        return (
            <div className={styles.user}>
                <div className={styles.name}>{name}</div>
                {getRoleBox(role, userId)}
            </div>
        );
    };

    return (
        <>
            <section>
                <h1>Users</h1>
                <ul className={styles.userList}>
                    {members.length > 0 ? (
                        members.map((user: CommitteeMember) => {
                            return <div key={user.id}>{getUser(user.displayname || 'Unknown', user.role, user.id)}</div>;
                        })
                    ) : (
                        <Loading />
                    )}
                    <div>
                        <button onClick={() => addUser()} data-button-type="primary">
                            Add User +
                        </button>
                    </div>
                </ul>
            </section>
            {createModal && (
                <Modal>
                    <h2>Add New User</h2>
                    <form id="add User" onSubmit={handleAddUser}>
                        <fieldset>
                            <label htmlFor="userName">Enter Username</label>
                            <input type="text" name="userName" id="userName" required={true} onChange={(ev) => setUserName(ev.target.value)} value={newUserName} />
                        </fieldset>
                        <Modal.Actions>
                            <button type="button" onClick={() => setCreateModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" id="submitUserButton" data-button-type="primary">
                                Add User
                            </button>
                        </Modal.Actions>
                    </form>
                </Modal>
            )}
        </>
    );
};

export { CommitteeViewUsers };
