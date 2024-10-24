import { FC } from 'react';
import { Link } from 'react-router-dom';
import style from './CommitteeNav.module.scss';

const CommitteeNav: FC = () => {
    return (
        <header className={style.header}>
            <Link to="/committees" data-button-type="ghost">
                {'< '}
            </Link>
            <div className={style.committee}>
                <span>Committee Name</span>
            </div>
            <nav className={style.nav}>
                <Link to="/committees/home" data-button-type="primary">
                    Overview
                </Link>
                <Link to="/committees/active-motions" data-button-type="secondary">
                    Active Motions
                </Link>
                <Link to="/committees/past-motions" data-button-type="secondary">
                    Past Motions
                </Link>
                <Link to="/committees/user" data-button-type="secondary">
                    View Users
                </Link>
                <Link to="/committees/control-panel" data-button-type="secondary">
                    Control Panel
                </Link>
            </nav>
        </header>
    );
};

export { CommitteeNav };
