import { FC } from 'react';
import style from './Home.module.scss';
import { Header } from '../components/Header/Header';

const Home: FC = () => {
    return (
        <>
            <Header />
            <main>
                <h1 className={style.title}>Robert's Rules of Order</h1>
                <h2>Test Page</h2>
                <p>This is a test page.</p>
            </main>
        </>
    );
};

export { Home };
