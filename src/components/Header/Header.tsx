import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RobertRulesOnlineIcon } from '../../assets/icons';
import { logout, selectIsLoggedIn } from '../../features/userSlice';
import style from './Header.module.scss';

const Header: FC = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(selectIsLoggedIn);

    return (
        <header className={style.header}>
            <Link to="/" className={style.logo}>
                <RobertRulesOnlineIcon />
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
                        <button onClick={() => dispatch(logout())} data-button-type="primary">
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
                            Sign Up
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export { Header };
