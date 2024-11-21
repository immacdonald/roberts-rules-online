import { createBrowserRouter, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import {
    Registration,
    ActiveMotions,
    PastMotions,
    ControlPanel,
    Home,
    Login,
    NotFound,
    Profile,
    ViewCommittees,
    CommitteeViewUsers,
    CommitteeView,
    CommitteeHome,
    MotionVote,
    MotionView
} from '../views';
import { RoutedApp } from './RoutedApp';

const router = createBrowserRouter([
    {
        path: '/',
        element: <RoutedApp />,
        children: [
            {
                path: '/',
                element: <Home />
            },
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/register',
                element: <Registration />
            },
            {
                path: '/profile',
                element: <Profile />
            },
            {
                path: '/committees',
                element: (
                    <ProtectedRoute>
                        <ViewCommittees />
                    </ProtectedRoute>
                )
            },
            {
                path: '/committees/:id',
                element: (
                    <ProtectedRoute>
                        <CommitteeView>
                            <Outlet />
                        </CommitteeView>
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: 'home',
                        element: <CommitteeHome />
                    },
                    {
                        path: 'control-panel',
                        element: <ControlPanel />
                    },
                    {
                        path: 'motions',
                        element: <ActiveMotions />
                    },
                    {
                        path: 'past-motions',
                        element: <PastMotions />
                    },
                    {
                        path: 'users',
                        element: <CommitteeViewUsers />
                    },
                    {
                        path: 'motions/:motion',
                        element: (
                            <ProtectedRoute>
                                <MotionView>
                                    <Outlet />
                                </MotionView>
                            </ProtectedRoute>
                        ),
                        children: [
                            {
                                path: '',
                                element: <MotionVote />
                            }
                        ]
                    }
                ]
            },
            {
                path: '*',
                element: <NotFound />
            }
        ]
    }
]);

export { router };
