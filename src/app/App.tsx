import { FC, useEffect } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useWebsiteContext } from '../contexts/useWebsiteContext';
import { WebsiteContextProvider } from '../contexts/WebsiteContext';
import { socket } from '../socket';
import { Registration, ActiveMotions, Motion, ControlPanel, Home, Login, NotFound, Profile, ViewCommittees, CommitteeViewUsers, CommitteeView, CommitteeHome } from '../views';

const RoutedApp: FC = () => {
    const { user, setUser, setCommittees } = useWebsiteContext();

    socket.on('chatMessage', (msg: any) => {
        console.log('Message:' + msg);
    });

    socket.on('login', (user: { id: string; username: string; displayname: string; email: string }, token: string) => {
        console.log(`Logged in as ${user.email}`);
        localStorage.setItem('token', token);
        setUser(user);

        setTimeout(() => {
            socket.emit('getCommittees');
        }, 1000);
    });

    socket.on('setCommittees', (committees: any) => {
        console.log('In RoutedApp', committees);
        setCommittees(committees);
    });

    socket.on('failedRegister', (msg: any) => {
        alert(msg);
    });

    useEffect(() => {
        console.log('Set user to', user);
    }, [user]);

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
