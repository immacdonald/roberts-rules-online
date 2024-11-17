import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsLoggedIn } from '../features/userSlice';

interface ProtectedRoute {
    redirect?: string;
    children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRoute> = ({ redirect = '/login', children }) => {
    const isLoggedIn = useSelector(selectIsLoggedIn);

    if (!isLoggedIn) {
        return <Navigate to={redirect} />;
    } else {
        return children;
    }
};

export { ProtectedRoute };
