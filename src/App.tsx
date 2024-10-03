import { useEffect } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Home, Login, NotFound, ViewCommittees } from './views';
import { MySocket } from './interfaces/socket';
import { Registration } from './views/Registration';

const socketExec = (name: string, ...args: any[]): void => {
    console.log('Executing socket...', name, args);
    MySocket.instance.socket.emit(name, ...args);
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Outlet />,
        children: [
            {
                path: '/login',
                element: <Login socketExec={socketExec} />
            },
            {
                path: '/register',
                element: <Registration socketExec={socketExec} />
            },
            {
                path: '/',
                element: <Home />
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

function App(): JSX.Element {
    useEffect(() => {
        const socket = MySocket.instance.socket;
        setTimeout(() => {
            console.log('lmaoooooo');
            socket.emit('chatMessage', 'lmaoooooo');
        }, 1000);

        socket.on('chatMessage', (msg) => {
            console.log('Message:' + msg);
        });

        socket.on('login', (username, email, displayname) => {
            console.log('Logged in as', username, email, displayname);
        });
    }, []);

    return <RouterProvider router={router} />;
}

export { App };
