import { FC, useState, FormEvent, ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    const user = useMemo(() => currentCommittee.members.find((member: CommitteeMember) => member.id == id)!, [id, currentCommittee]);

    const [addUserModal, setAddUserModal] = useState<boolean>(false);
    const [newUser, setNewUser] = useState<string>('');

    const addUser = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Adding new user:', newUser);
        socket!.emit('addUserToCommittee', currentCommittee.id, newUser);
        setAddUserModal(false);
    };

    const getUser = (name: string, username: string, role: string, userId: string): ReactElement => {
        const getRoleBox = (role: string, userId: string): ReactElement => {
            if (role == 'owner') {
                if (currentCommittee.members.some((member: CommitteeMember) => member.role == 'chair')) {
                    return (
                        <>
                            <b>Chair</b>
                            <ChairIcon />
                        </>
                    );
                default:
                    return (
                        <>
                            <b>Member</b>
                        </>
                    );
            }
        };

        return (
            <div className={styles.user}>
                <div className={styles.name}>
                    {name} (@{username})
                </div>
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
                            return <div key={user.id}>{getUser(user.displayname || 'Unknown', user.username || 'Unknown', user.role, user.id)}</div>;
                        })
                    ) : (
                        <Loading />
                    )}
                    {(user.role == 'owner' || user.role == 'chair') && (
                        <div className={styles.addUser}>
                            <button onClick={() => setAddUserModal(true)} data-button-type="primary">
                                Add User +
                            </button>
                        </div>
                    )}
                </ul>
            </section>
            {addUserModal && (
                <Modal>
                    <h2>Add New User</h2>
                    <form id="add User" onSubmit={addUser}>
                        <fieldset>
                            <label htmlFor="userName">Enter Username or Email</label>
                            <input type="text" name="userName" id="userName" required={true} onChange={(ev) => setNewUser(ev.target.value)} value={newUser} />
                        </fieldset>
                        <Modal.Actions>
                            <button type="button" onClick={() => setAddUserModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" id="submitUserButton" data-button-type="primary" disabled={newUser.length < 2}>
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
