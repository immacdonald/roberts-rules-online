import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../components';
import style from './Home.module.scss';

const NotFound: FC = () => {
    return (
        <Page>
            <h1 className={style.title}>Whoops!</h1>
            <h2>That page could not be found.</h2>
            <Link to="/" style={{ color: 'var(--color-text)' }}>
                Return to the home page.
            </Link>
        </Page>
    );
};

export { NotFound };
