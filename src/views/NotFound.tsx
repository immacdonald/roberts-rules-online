import { FC } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Page } from '../components';

const NotFound: FC = () => {
    return (
        <HelmetProvider>
            <Helmet>
                <title>404 - Robert's Rules</title>
            </Helmet>
            <Page>
                <section>
                    <h1>Whoops!</h1>
                    <h2>That page could not be found.</h2>
                    <Link to="/" style={{ color: 'var(--color-text)' }}>
                        Return to the home page.
                    </Link>
                </section>
            </Page>
        </HelmetProvider>
    );
};

export { NotFound };
