import { FC } from 'react';
import { Link } from 'react-router-dom';
import style from './Header.module.scss';

const Header: FC = () => {
    return (
        <header className={style.header}>
            <div className={style.logo}>
                <span>
                    <b>Robert's Rules Online</b>
                </span>
            </div>
            <nav className={style.nav}>
                <Link to="/">Home</Link>
                <Link to="/committees">Committees</Link>
                <Link to="/login">Login</Link>
                <Link to="/register" className={style.highlight}>
                    Register
                </Link>
            </nav>
        </header>
    );
};

export { Header };
