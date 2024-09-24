import {useEffect} from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Home, Login, NotFound } from './views';

import { MySocket } from './interfaces/socket';

function socketExec(name, ...args: any[]):void{
	console.log("Executing socket...", name, args);
	MySocket.instance.socket.emit(name, ...args);
}

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
				path: '/',
				element: <Home socketExec={socketExec} />
			},
			{
				path: '*',
				element: <NotFound socketExec={socketExec} />
			}
        ]
    }
]);

function App() : JSX.Element{
	useEffect(() => {
		let socket = MySocket.instance.socket;
		setTimeout(() => {
			console.log("lmaoooooo");
			socket.emit('chatMessage', "lmaoooooo");
		}, 1000);

		socket.on("chatMessage", (msg) => {
			console.log("Message:" + msg);
		});
	}, []);


	return (
		<RouterProvider router={router}/>
	);
}

export {App};
