import { FC } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentCommittee } from '../../features/committeesSlice';

const CommitteeHome: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee)!;

    return (
        <section>
            <header>
                <h1>{currentCommittee.name}</h1>
            </header>
            <p>{currentCommittee.description || 'No description written.'}</p>
        </section>
    );
};

export { CommitteeHome };
