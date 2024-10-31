import { FC } from 'react';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';

const CommitteeHome: FC = () => {
    const { currentCommittee } = useWebsiteContext();

    return (
        <section>
            <header>
                <h1>{currentCommittee!.name}</h1>
            </header>
            <p>{currentCommittee!.description || 'No description written.'}</p>
        </section>
    );
};

export { CommitteeHome };
