import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';
import style from './Header.module.scss';
import { RobertRulesOnlineIcon } from '../../assets/icons';

const Header: FC = () => {
    const { isLoggedIn, logout } = useWebsiteContext();

    return (
        <header className={style.header}>
            <Link to='/' className={style.logo}>
                <RobertRulesOnlineIcon/>
                <span>
                    <b>Robert's Rules Online</b>
                </span>
            </Link>
            <nav className={style.nav}>
                <Link to="/" data-button-type="ghost">
                    Home
                </Link>
                {isLoggedIn ? (
                    <>
                        <Link to="/committees" data-button-type="ghost">
                            Committees
                        </Link>
                        <button onClick={() => logout()} data-button-type="primary">
                            Logout
                        </button>
                        <Link to="/profile" className={style.profile} />
                    </>
                ) : (
                    <>
                        <Link to="/login" data-button-type="ghost">
                            Login
                        </Link>
                        <Link to="/register" data-button-type="primary">
                            Register
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export { Header };
