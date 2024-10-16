import { FC, useEffect } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Home, Login, NotFound, Profile, ViewCommittees } from './views';
import { MySocket } from './interfaces/socket';
import { Registration } from './views/Auth/Registration';

const socketExec = (name: string, ...args: any[]): void => {
    console.log('Executing socket...', name, args);
    MySocket.instance.socket.emit(name, ...args);
};

const RoutedApp: FC = () => {
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
                path: '*',
                element: <NotFound />
            }
        ]
    }
]);

const App: FC = () => {
    useEffect(() => {
        const socket = MySocket.instance.socket;

        socket.on('chatMessage', (msg) => {
            console.log('Message:' + msg);
        });

        socket.on('login', (username, email, displayname) => {
            console.log('Logged in as', username, email, displayname);
        });
    }, []);

    return <RouterProvider router={router} />;
};

export { App };
