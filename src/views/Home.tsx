import { FC } from 'react';
import { Header, Footer } from '../components';
import style from './Home.module.scss';

const Home: FC = () => {
    return (
        <>
            <Header />
            <main>
                <h1 className={style.title}>Robert's Rules of Order</h1>
                <h2>Test Page</h2>
                <p>This is a test page.</p>
            </main>
            <Footer />
        </>
    );
};

export { Home };
