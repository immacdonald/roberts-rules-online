import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';
import style from './CommitteeNav.module.scss';

const CommitteeNav: FC = () => {
    const { currentCommittee } = useWebsiteContext();

    const { pathname } = useLocation();

    const activeLink = (link: string) => (pathname.endsWith(link) ? 'primary' : 'secondary');

    return (
        <header className={style.header}>
            <Link to="/committees" data-button-type="ghost">
                &larr;
            </Link>
            <div className={style.committee}>
                <span>{currentCommittee!.name}</span>
            </div>
            <nav className={style.nav}>
                <Link to={`/committees/${currentCommittee!.id}/home`} data-button-type={activeLink('/home')}>
                    Overview
                </Link>
                <Link to={`/committees/${currentCommittee!.id}/active-motions`} data-button-type={activeLink('/active-motions')}>
                    Active Motions
                </Link>
                <Link to={`/committees/${currentCommittee!.id}/past-motions`} data-button-type={activeLink('/past-motions')}>
                    Past Motions
                </Link>
                <Link to="/committees/motion" data-button-type="secondary">
                    Motion Vote
                </Link>
                <Link to={`/committees/${currentCommittee!.id}/users`} data-button-type={activeLink('/users')}>
                    View Users
                </Link>
                <Link to={`/committees/${currentCommittee!.id}/control-panel`} data-button-type={activeLink('/control-panel')}>
                    Control Panel
                </Link>
            </nav>
        </header>
    );
};

export { CommitteeNav };
