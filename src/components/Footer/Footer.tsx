import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsLoggedIn } from '../../features/userSlice';
import styles from './Footer.module.scss';

const Footer: FC = () => {
    const isLoggedIn = useSelector(selectIsLoggedIn);

    return (
        <footer className={styles.footer}>
            <div className={styles.details}>
                <div>
                    <span>About</span>
                    <p>Robert’s Rules Online gives you the tools to manage, record, and streamline meetings so that no time is wasted.</p>
                </div>
                <div>
                    <span>Navigation</span>
                    <Link to="/">Home</Link>
                    {isLoggedIn ? (
                        <Link to="/committees">Committees</Link>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Sign Up</Link>
                        </>
                    )}
                </div>
                <div>
                    <span>Legal</span>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms-of-use">Terms of Use</Link>
                </div>
            </div>
            <div className={styles.copyright}>
                <span>© Robert’s Rules Online 2024</span>
            </div>
        </footer>
    );
};

export { Footer };
