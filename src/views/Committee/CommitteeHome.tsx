import { FC } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { selectCurrentCommittee } from '../../features/committeesSlice';

const CommitteeHome: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee)!;

    return (
        <HelmetProvider>
            <Helmet>
                <title>{currentCommittee.name} - Robert's Rules</title>
            </Helmet>
            <section>
                <header>
                    <h1>{currentCommittee.name}</h1>
                </header>
                <p>{currentCommittee.description || 'No description written.'}</p>
            </section>
        </HelmetProvider>
    );
};

export { CommitteeHome };
