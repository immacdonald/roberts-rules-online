import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { CloseIcon, EditIcon } from '../../assets/icons';
import { Loading, Page } from '../../components';
import { selectIsLoggedIn, selectUser } from '../../features/userSlice';
import { socket } from '../../socket';
import styles from './Profile.module.scss';

const Profile: FC = () => {
    const user = useSelector(selectUser);
    const isLoggedIn = useSelector(selectIsLoggedIn);

    const [editMode, setEditMode] = useState<boolean>(false);
    const [editContents, setEditContents] = useState<string>(user?.displayname || '');

    const [loading, setLoading] = useState<boolean>(false);

    const submit = () => {
        socket!.emit('updateUserName', editContents);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 3000);
    };

    if (!isLoggedIn) {
        return <Navigate to="/" />;
    }

    return (
        <Page>
            <section>
                <header>
                    <h1>Profile</h1>
                </header>
                <p>View and modify your user profile and account settings here.</p>
                <div className={styles.profile}>
                    {!loading ? (
                        <>
                            <header>
                                <h2>Personal Info</h2>
                                <button data-button-type="ghost" onClick={() => setEditMode(!editMode)} style={{ marginLeft: 'auto' }}>
                                    {editMode ? (
                                        <span className={styles.indicator}>
                                            <CloseIcon /> Cancel
                                        </span>
                                    ) : (
                                        <span className={styles.indicator}>
                                            <EditIcon /> Edit
                                        </span>
                                    )}
                                </button>
                            </header>
                            <div className={styles.info} data-edit-mode={editMode ? editMode : undefined}>
                                <div className={styles.row}>
                                    <fieldset>
                                        <label htmlFor="name">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            onChange={(ev) => setEditContents(ev.target.value)}
                                            value={editContents}
                                            className={styles.edit}
                                            disabled={!editMode}
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label htmlFor="username">Username</label>
                                        <input type="text" name="username" id="username" value={user?.username || ''} disabled />
                                    </fieldset>
                                </div>
                                <div className={styles.row}>
                                    <fieldset>
                                        <label htmlFor="email">Email</label>
                                        <input type="text" name="email" id="email" value={user?.email || ''} disabled />
                                    </fieldset>
                                </div>
                            </div>
                            {editMode && (
                                <div className={styles.actions}>
                                    <button data-button-type="secondary" onClick={() => setEditMode(false)}>
                                        Cancel
                                    </button>
                                    <button data-button-type="primary" onClick={() => submit()}>
                                        Update Profile
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Loading />
                    )}
                </div>
            </section>
        </Page>
    );
};

export { Profile };
