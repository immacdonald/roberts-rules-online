import { FC } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import store from '../features/store';
import { router } from './router';

const App: FC = () => {
    return (
        <Provider store={store}>
            <HelmetProvider>
                <RouterProvider
                    router={router}
                    future={{
                        v7_startTransition: true
                    }}
                />
            </HelmetProvider>
        </Provider>
    );
};

export { App };
