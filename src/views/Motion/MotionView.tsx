import { FC, ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components';
import { selectCurrentMotion, setCurrentMotion } from '../../features/committeesSlice';

interface MotionViewProps {
    children: ReactNode;
}

const MotionView: FC<MotionViewProps> = ({ children }) => {
    const { motion } = useParams();
    const dispatch = useDispatch();
    const currentMotion = useSelector(selectCurrentMotion);

    useEffect(() => {
        if (motion) {
            dispatch(setCurrentMotion(motion));
        }
    }, [motion]);

    if (!currentMotion || motion != currentMotion.id) {
        return <Loading />;
    }

    return children;
};

export { MotionView };
