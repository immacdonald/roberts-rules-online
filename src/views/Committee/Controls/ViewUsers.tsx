import { FC, useState, FormEvent, ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CommitteeMember } from 'types';
import { ChairIcon, HomeIcon } from '../../../assets/icons';
import { Loading } from '../../../components';
import { Modal } from '../../../components/Modal';
import { selectCurrentCommittee } from '../../../features/committeesSlice';
import { selectUser } from '../../../features/userSlice';
import { socket } from '../../../socket';
import styles from './ViewUsers.module.scss';

const CommitteeViewUsers: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee)!;
    const { id } = useSelector(selectUser)!;

    const user = useMemo(() => currentCommittee.members.find((member: CommitteeMember) => member.id == id)!, [id, currentCommittee]);

    const [createModal, setCreateModal] = useState<boolean>(false);
    const [newUser, setNewUser] = useState<string>('');

    const promoteUser = (userId: string): void => {
        console.log('Promoting user:', userId);
    };

    const addUser = (): void => {
        console.log('Adding new user');
        setCreateModal(true);
    };

    const handleAddUser = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Adding new user:', newUser);
        // Add the new user

        socket!.emit('addUserToCommittee', currentCommittee.id, newUser);
    };

    const getUser = (name: string, role: string, userId: string): ReactElement => {
        const getRoleBox = (role: string, userId: string): ReactElement => {
            if (role == 'owner') {
                if (currentCommittee.members.some((member: CommitteeMember) => member.role == 'chair')) {
                    return (
                        <div className={styles.role}>
                            <b>Owner</b>
                            <HomeIcon />
                        </div>
                    );
                } else {
                    return (
                        <div className={styles.role}>
                            <b>Owner/Chair</b>
                            <HomeIcon /> <ChairIcon />
                        </div>
                    );
                }
            } else if (role == 'chair') {
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
                        {(user.role == 'owner' || user.role == 'chair') && <button onClick={() => promoteUser(userId)}>Promote</button>}
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
                    {currentCommittee.members.length > 0 ? (
                        currentCommittee.members.map((user: CommitteeMember) => {
                            return <div key={user.id}>{getUser(user.displayname || 'Unknown', user.role, user.id)}</div>;
                        })
                    ) : (
                        <Loading />
                    )}
                    {(user.role == 'owner' || user.role == 'chair') && (
                        <div>
                            <button onClick={() => addUser()} data-button-type="primary">
                                Add User +
                            </button>
                        </div>
                    )}
                </ul>
            </section>
            {createModal && (
                <Modal>
                    <h2>Add New User</h2>
                    <form id="add User" onSubmit={handleAddUser}>
                        <fieldset>
                            <label htmlFor="userName">Enter Username or Email</label>
                            <input type="text" name="userName" id="userName" required={true} onChange={(ev) => setNewUser(ev.target.value)} value={newUser} />
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
