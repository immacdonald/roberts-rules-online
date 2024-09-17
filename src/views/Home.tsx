import { FC } from 'react';
import style from './Home.module.scss';

const Home: FC = () => {
    return (
        <main>
            <h1 className={style.title}>Robert's Rules of Order</h1>
            <h2>Home Page</h2>
            <p>This is the home page.</p>
        </main>
    );
};

export { Home };
