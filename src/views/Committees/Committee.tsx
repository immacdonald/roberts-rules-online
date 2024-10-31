import { FC, ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../../components';
import { CommitteeNav } from '../../components/CommitteeNav';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';

interface CommitteeViewProps {
    children: ReactNode;
}

const CommitteeView: FC<CommitteeViewProps> = ({ children }) => {
    const { id } = useParams();

    const { currentCommittee, setCurrentCommittee } = useWebsiteContext();

    useEffect(() => {
        if (id) {
            setCurrentCommittee(id);
        }
    }, [id]);

    return (
        <Page>
            {currentCommittee ? (
                <>
                    <CommitteeNav />
                    {children}
                </>
            ) : (
                <section>
                    <h1>Loading committee...</h1>
                </section>
            )}
        </Page>
    );
};

export { CommitteeView };
