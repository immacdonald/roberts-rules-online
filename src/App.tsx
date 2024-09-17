import { FC } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom"
import { Home, Login, NotFound } from "./views";

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Outlet />
        ),
        children: [
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/',
                element: <Home />
            },
            {
                path: '*',
                element: <NotFound />
            }
        ]
    }
]);

const App: FC = () => <RouterProvider router={router} />;

export { App }