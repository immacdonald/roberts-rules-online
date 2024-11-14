import { FC, useState, FormEvent } from 'react';
import { Page } from '../../components';
import styles from './Committees.module.scss';
import { CommitteeNav } from '../../components/CommitteeNav';
import { CommitteeMember } from 'types';
import { Modal } from '../../components/Modal';

import ChairIcon from '../../assets/images/ChairIcon.png';
import HouseIcon from '../../assets/images/HouseIcon.png';

const CommitteeViewUsers: FC = () => {

    //sample user data
    const [users, setUsers] = useState<CommitteeMember[]>([
        {
            id: '1',
            role: 'Owner',
            username: 'johndoe',
            displayname: 'John Doe'
        },
        {
            id: '2',
            role: 'Chair',
            username: 'janedoe',
            displayname: 'Jane Doe'
        },
        {
            id: '3',
            role: 'Member',
            username: 'mikesmith',
            displayname: 'Mike Smith'
        },
        {
            id: '4',
            role: 'Member',
            username: 'emilyjones',
            displayname: 'Emily Jones'
        },
        {
            id: '5',
            role: 'Member',
            username: 'sarahjohnson',
            displayname: 'Sarah Johnson'
        }
    ]);

    const getRoleBox = (role: string, userId: string) => {
        if (role === 'Owner') {
            return (
                <div className={styles.roleBox}>
                    <img src={HouseIcon} className={styles.iconImage} alt="Chair Icon" />
                </div>
            );
        } else if (role === 'Chair') {
            return (
                <div className={styles.roleBox}>
                    <img src={ChairIcon} className={styles.iconImage} alt="Chair Icon" />
                </div>
            );
        } else {
            return (
                <div className={styles.roleBox}>
                    <button onClick={() => promoteUser(userId)}>promote</button>
                </div>
            );
        }
    };

    const promoteUser = (userId: string) => {
        console.log('Promoting user:', userId);

        var chairId: number | undefined;

        // Find current Chair and the user to promote
        users.forEach((user, index) => {
            if (user.role === 'Chair') {
                chairId = index;
            }
        });

        // Create a copy of the users array
        const tempUsers = [...users];

        if (chairId !== undefined) {
            tempUsers[chairId].role = 'Member';
        }
        tempUsers.forEach((user, index) => {
            if (user.id === userId) {
                tempUsers[index].role = 'Chair';
            }
        });

        setUsers(tempUsers);
    }


    const getUser = (name: string, role: string, userId: string) => {
        return (
            <div className={styles.userAndRole}>
                <div className={styles.userBox}>
                    <div className={styles.userNameText}>{name}</div>
                </div>
                {getRoleBox(role, userId)}
            </div>
        );
    };

    const getAddUserButton = () => {
        return (
            <div>
                <button className={styles.addUserButton} onClick={() => addUser()}>Add User</button>
            </div>
        );
    }

    const [createModal, setCreateModal] = useState<boolean>(false);

    const [newUserName, setUserName] = useState<string>('');

    const addUser = (): void => {
        console.log('Adding new user');
        setCreateModal(true);
    };

    const handleAddUser = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Adding new user:', newUserName);
        // add the new user
        //do backend stuff here

        //socket.emit('addUser', newUserName);
    };

    return (
        <>
            <section>
                <ul className={styles.userList}>
                    {users.length > 0 ? (
                        users.map((user: CommitteeMember) => {
                            console.log(user);
                            return (
                                <div key={user.id}>
                                    {getUser(user.displayname || 'Unknown', user.role, user.id)}
                                </div>
                            );
                        })
                    ) : (
                        <p>Loading users... </p>
                    )}
                    {getAddUserButton()}
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
                        <div className={styles.actions}>
                            <button onClick={() => setCreateModal(false)}>Cancel</button>
                            <button type="submit" id="submitUserButton" data-button-type="primary">
                                Add User
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

export { CommitteeViewUsers };