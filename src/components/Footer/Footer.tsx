import { FC } from 'react';
import { Link } from 'react-router-dom';
import style from './Footer.module.scss';

const Footer: FC = () => {
    return (
        <footer className={style.footer}>
            <div className={style.details}>
                <div>
                    <span>About</span>
                    <p>Robert’s Rules Online gives you the tools to manage, record, and streamline meetings so that no time is wasted.</p>
                </div>
                <div>
                    <span>Navigation</span>
                    <Link to="/">Home</Link>
                    <Link to="/committees">Committees</Link>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </div>
                <div>
                    <span>Legal</span>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms-of-use">Terms of Use</Link>
                </div>
            </div>
            <div className={style.copyright}>
                <span>© Robert’s Rules Online 2024</span>
            </div>
        </footer>
    );
};

export { Footer };
