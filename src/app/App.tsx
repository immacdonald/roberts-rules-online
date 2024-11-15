import { FC, useEffect, useRef, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { User } from 'server/interfaces/user';
import { CommitteeData, MotionData } from 'types';
import { login } from '../auth';
import { Loading } from '../components';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { selectCommittees, setCommitteeMotions, setCommittees } from '../features/committeesSlice';
import store from '../features/store';
import { selectUser, setUser } from '../features/userSlice';
import { disconnectSocket, initializeSocket, socket } from '../socket';
import { Registration, ActiveMotions, PastMotions, ControlPanel, Home, Login, NotFound, Profile, ViewCommittees, CommitteeViewUsers, CommitteeView, CommitteeHome, MotionVote } from '../views';

const RoutedApp: FC = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const committees = useSelector(selectCommittees);
    const committeesRef = useRef<CommitteeData[] | null>(committees);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize the app and check whether the user session should be resumed
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            login(undefined, undefined, token).then((user: User | null) => {
                if (user) {
                    dispatch(setUser(user));

                    const maxCommitteeWaitTime = 5000;
                    const committeeRetryDelay = 100;

                    const startTime = Date.now();

                    const interval = setInterval(() => {
                        if (committeesRef.current || Date.now() - startTime >= maxCommitteeWaitTime) {
                            clearInterval(interval);
                            setIsLoading(false);
                        }
                    }, committeeRetryDelay);


                } else {
                    localStorage.removeItem('token');
                    setIsLoading(false);
                }
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            initializeSocket();
        } else {
            disconnectSocket();
        }
    }, [user]);

    useEffect(() => {
        // Keep the ref updated with the latest value of committees to avoid stale data
        committeesRef.current = committees;
    }, [committees]);

    // Update socket listeners each time the socket is opened or closed
    useEffect(() => {
        if (socket) {
            // Register socket event listeners
            socket.on('chatMessage', (msg: any) => {
                console.log('Message:', msg);
            });

            socket.on('setCommittees', (committees: CommitteeData[]) => {
                console.log('Got committees', committees);
                dispatch(setCommittees(committees));
            });

            socket.on('setMotions', (motions: MotionData[]) => {
                console.log('Setting motions', motions);
                dispatch(setCommitteeMotions(motions));
            });

            socket!.emit('getCommittees');
        }

        // Cleanup function to remove listeners if socket changes or on component unmount
        return () => {
            if (socket) {
                socket.off('chatMessage');
                socket.off('setCommittees');
                socket.off('setMotions');
            }
        };
    }, [socket]);

    if (isLoading) {
        return <Loading />;
    }

    return <Outlet />;
};

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
                        path: 'active-motions',
                        element: <ActiveMotions />
                    },
                    {
                        path: 'past-motions',
                        element: <PastMotions />
                    },
                    {
                        path: 'motion-vote',
                        element: <MotionVote />
                    },
                    {
                        path: 'users',
                        element: <CommitteeViewUsers />
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

const App: FC = () => {
    return (
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    );
};

export { App };
