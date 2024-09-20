import { FC, ReactNode } from 'react';
import { Header, Footer } from '../';
import style from './Page.module.scss';

interface PageProps {
    children: ReactNode;
}

const Page: FC<PageProps> = ({ children }) => {
    return (
        <>
            <Header />
            <main className={style.page}>{children}</main>
            <Footer />
        </>
    );
};

export { Page };
