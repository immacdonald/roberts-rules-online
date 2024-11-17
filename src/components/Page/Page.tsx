import { FC, ReactNode } from 'react';
import { Header, Footer } from '../';
import styles from './Page.module.scss';

interface PageProps {
    children: ReactNode;
}

const Page: FC<PageProps> = ({ children }) => {
    return (
        <>
            <Header />
            <main className={styles.page}>
                {children}
                <Footer />
            </main>
        </>
    );
};

export { Page };
