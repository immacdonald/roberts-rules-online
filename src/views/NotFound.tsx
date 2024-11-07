import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../components';

const NotFound: FC = () => {
    return (
        <Page>
            <section>
                <h1>Whoops!</h1>
                <h2>That page could not be found.</h2>
                <Link to="/" style={{ color: 'var(--color-text)' }}>
                    Return to the home page.
                </Link>
            </section>
        </Page>
    );
};

export { NotFound };
