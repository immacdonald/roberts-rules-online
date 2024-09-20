import { FC } from 'react';
import style from './Home.module.scss';

const NotFound: FC = () => {
    return (
        <main>
            <h1 className={style.title}>Whoops!</h1>
            <h2>That page could not be found.</h2>
            <a href=".">Return to the home page.</a>
        </main>
    );
};

export { NotFound };
