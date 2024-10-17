import { FC } from 'react';
import { Link } from 'react-router-dom';
import style from './CommitteeNav.module.scss';

const CommitteeNav: FC = () => {
    return (
        <header className={style.header}>
            <div className={style.committee}>
                <span>Committee Name</span>
            </div>
            <nav className={style.nav}>
                <Link to="/" data-button-type="primary">
                    Active Motions
                </Link>
                <Link to="/" data-button-type="secondary">
                    Past Motions
                </Link>
                <Link to="/" data-button-type="secondary">
                    View Users
                </Link>
                <Link to="/" data-button-type="secondary">
                    Control Panel
                </Link>
            </nav>
        </header>
    );
};

export { CommitteeNav };
