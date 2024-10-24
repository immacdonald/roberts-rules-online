import { FC, useEffect } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Home, Login, NotFound, ViewCommittees, ControlPanel } from './views';
import { MySocket } from './interfaces/socket';
import { CommitteeHome, Home, Login, NotFound, Profile, ViewCommittees } from './views';
import { Registration } from './views/Auth/Registration';

const socketExec = (name: string, ...args: any[]): void => {
    console.log('Executing socket...', name, args);
    MySocket.instance.socket.emit(name, ...args);
};

const RoutedApp: FC = () => {
    const { user, setUser } = useWebsiteContext();

    useEffect(() => {
        const socket = MySocket.instance.socket;

        socket.on('chatMessage', (msg) => {
            console.log('Message:' + msg);
        });

        socket.on('login', (user: { id: string; username: string; displayname: string; email: string }, token) => {
            console.log(`Logged in as ${user.email}`);
            localStorage.setItem('token', token);
            setUser(user);
        });
    }, []);

    useEffect(() => {
        console.log('Set user to', user);
    });

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
                element: <Login socketExec={socketExec} />
            },
            {
                path: '/register',
                element: <Registration socketExec={socketExec} />
            },
            {
                path: '/profile',
                element: <Profile socketExec={socketExec} />
            },
            {
                path: '/committees',
                element: <ViewCommittees socketExec={socketExec} />
            },
            {
                path: '/committees/control-panel',
                element: <ControlPanel />
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
