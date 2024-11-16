import { FC, ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface MotionViewProps {
    children: ReactNode;
}

const MotionView: FC<MotionViewProps> = ({ children }) => {
    const { motion } = useParams();

    useEffect(() => {
        if (motion) {
            console.log(motion);
        }
    }, [motion]);

    return children;
};

export { MotionView };
