import type { SocketExec } from '../../../types';
import { FC, useEffect } from 'react';
import { Page } from '../../components';

interface ProfileProps {
    socketExec: SocketExec;
}

const Profile: FC<ProfileProps> = ({ socketExec }) => {
    useEffect(() => {
        console.log(socketExec);
    }, []);

    return (
        <Page>
            <section>
                <header>
                    <h1>Profile</h1>
                </header>
                <p>Here is your profile.</p>
            </section>
        </Page>
    );
};

export { Profile };
