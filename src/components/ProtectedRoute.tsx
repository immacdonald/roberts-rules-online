import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useWebsiteContext } from '../contexts/useWebsiteContext';

interface ProtectedRoute {
    redirect?: string;
    children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRoute> = ({ redirect = '/login', children }) => {
    const { isLoggedIn } = useWebsiteContext();

    if (!isLoggedIn) {
        return <Navigate to={redirect} />;
    } else {
        return children;
    }
};

export { ProtectedRoute };
