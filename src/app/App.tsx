import { FC, useEffect, useState } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useWebsiteContext } from '../contexts/useWebsiteContext';
import { WebsiteContextProvider } from '../contexts/WebsiteContext';
import { disconnectSocket, initializeSocket, socket } from '../socket';
import { Registration, ActiveMotions, PastMotions, Motion, ControlPanel, Home, Login, NotFound, Profile, ViewCommittees, CommitteeViewUsers, CommitteeView, CommitteeHome } from '../views';
import { CommitteeData, MotionData } from 'types';
import { login } from '../auth';
import { User } from 'server/interfaces/user';

const RoutedApp: FC = () => {
    const { user, setUser, setCommittees, setCommitteeMotions } = useWebsiteContext();

    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize the app and check whether the user session should be resumed
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            login(undefined, undefined, token).then((user: User | null) => {
                if (user) {
                    setUser(user);
                } else {
                    localStorage.removeItem('token');
                }
                setIsLoading(false);
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
    }, [user])

    // Update socket listeners each time the socket is opened or closed
    useEffect(() => {
        if (socket) {
            // Register socket event listeners
            socket.on('chatMessage', (msg: any) => {
                console.log('Message:', msg);
            });

            socket.on('setCommittees', (committees: CommitteeData[]) => {
                //console.log("Got committees", committees)
                setCommittees(committees);
            });

            socket.on('setMotions', (motions: MotionData[]) => {
                //console.log("Setting motions", motions)
                setCommitteeMotions(motions);
            });

            socket.on('failedRegister', (msg: any) => {
                alert(msg);
            });

            socket!.emit('getCommittees');
        }

        // Cleanup function to remove listeners if socket changes or on component unmount
        return () => {
            if (socket) {
                socket.off('chatMessage');
                socket.off('setCommittees');
                socket.off('setMotions');
                socket.off('failedRegister');
            }
        };
    }, [socket]);

    if (isLoading) {
        return <div>Loading...</div>;
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
                        path: 'motion',
                        element: <Motion />
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
        <WebsiteContextProvider>
            <RouterProvider router={router} />
        </WebsiteContextProvider>
    );
};

export { App };
