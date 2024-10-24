import { FC, useEffect, useRef } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { useWebsiteContext } from './contexts/useWebsiteContext';
import { WebsiteContextProvider } from './contexts/WebsiteContext';
import { Committees } from './interfaces/Committees';
import { MySocket } from './interfaces/socket';
import { CommitteeHome, ControlPanel, Home, Login, NotFound, Profile, ViewCommittees } from './views';
import { Registration } from './views/Auth/Registration';
import { ActiveMotions } from './views/Motions';

const socketExec = (name: string, ...args: any[]): void => {
    console.log('Executing socket...', name, args);
    MySocket.instance.socket.emit(name, ...args);
};

const RoutedApp: FC = () => {
    const { user, setUser, setCommittees } = useWebsiteContext();

    const socket = useRef<any>(MySocket.instance.socket);

    socket.current.on('chatMessage', (msg: any) => {
        console.log('Message:' + msg);
    });

    socket.current.on('login', (user: { id: string; username: string; displayname: string; email: string }, token: string) => {
        console.log(`Logged in as ${user.email}`);
        localStorage.setItem('token', token);
        setUser(user);

        setTimeout(() => {
            socket.current.emit("getCommittees");
        }, 1000 )
    });

    socket.current.on('setCommittees', (committees: any) => {
        console.log("In RoutedApp", committees);
        Committees.instance.setCommittees(committees);
        setCommittees(committees);
        
    });

    socket.current.on('failedRegister', (msg: any) => {
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
                path: '/committees/home',
                element: <CommitteeHome />
            },
            {
                path: '/committees/active-motions',
                element: <ActiveMotions socketExec={socketExec} />
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
