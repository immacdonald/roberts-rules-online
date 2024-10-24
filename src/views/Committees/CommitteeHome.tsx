import { FC } from 'react';
import { Page } from '../../components';
import { CommitteeNav } from '../../components/CommitteeNav';

const CommitteeHome: FC = () => {
    return (
        <Page>
            <CommitteeNav />
            <section>
                <header>
                    <h1>Committee Name</h1>
                    <p>
                        Description ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ....
                    </p>
                </header>
            </section>
        </Page>
    );
};

export { CommitteeHome };
