import type { SocketExec } from '../../../types';
import { FC, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Page } from '../../components';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';

interface ProfileProps {
    socketExec: SocketExec;
}

const Profile: FC<ProfileProps> = ({ socketExec }) => {
    const { user, isLoggedIn } = useWebsiteContext();

    if (!isLoggedIn) {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        console.log(socketExec);
    }, []);

    return (
        <Page>
            <section>
                <header>
                    <h1>Profile</h1>
                </header>
                <p>View and modify your account settings here.</p>
                <hr />
                <h3>Account Settings</h3>
                <p>
                    <b>Name:</b> {user.displayname}
                </p>
                <p>
                    <b>Username:</b> {user.username}
                </p>
                <p>
                    <b>Email:</b> {user.email}
                </p>
            </section>
        </Page>
    );
};

export { Profile };
