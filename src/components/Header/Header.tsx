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
                <Link to="/" data-button-type="ghost">
                    Home
                </Link>
                <Link to="/committees" data-button-type="ghost">
                    Committees
                </Link>
                <Link to="/login" data-button-type="ghost">
                    Login
                </Link>
                <Link to="/register" data-button-type="primary">
                    Register
                </Link>
                <Link to="/profile" className={style.profile} />
            </nav>
        </header>
    );
};

export { Header };
