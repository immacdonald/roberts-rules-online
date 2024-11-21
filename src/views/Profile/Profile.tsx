import { FC } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Page } from '../../components';
import { selectIsLoggedIn, selectUser } from '../../features/userSlice';

const Profile: FC = () => {
    const user = useSelector(selectUser);
    const isLoggedIn = useSelector(selectIsLoggedIn);

    if (!isLoggedIn) {
        return <Navigate to="/" />;
    }

    return (
        <HelmetProvider>
            <Helmet>
                <title>Profile - Robert's Rules</title>
            </Helmet>
            <Page>
                <section>
                    <header>
                        <h1>Profile</h1>
                    </header>
                    <p>View and modify your account settings here.</p>
                    <hr />
                    <h3>Account Settings</h3>
                    <p>
                        <b>Name:</b> {user!.displayname}
                    </p>
                    <p>
                        <b>Username:</b> {user!.username}
                    </p>
                    <p>
                        <b>Email:</b> {user!.email}
                    </p>
                </section>
            </Page>
        </HelmetProvider>
    );
};

export { Profile };
