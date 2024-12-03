import { FC, ReactNode, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Loading, Page } from '../../components';
import { CommitteeNav } from '../../components/CommitteeNav';
import { selectCurrentCommittee, setCurrentCommittee } from '../../features/committeesSlice';

interface CommitteeViewProps {
    children: ReactNode;
}

const CommitteeView: FC<CommitteeViewProps> = ({ children }) => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const currentCommittee = useSelector(selectCurrentCommittee);

    useEffect(() => {
        if (id) {
            dispatch(setCurrentCommittee(id));
        }
    }, [id]);

    if (!currentCommittee) {
        return <Loading />;
    }

    return (
        <Page>
            <Helmet>
                <title>{currentCommittee.name} - Robert's Rules</title>
            </Helmet>
            <CommitteeNav />
            {children}
        </Page>
    );
};

export { CommitteeView };
