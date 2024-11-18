import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { BackArrowIcon } from '../../assets/icons';
import { selectCurrentCommittee } from '../../features/committeesSlice';
import styles from './CommitteeNav.module.scss';

const CommitteeNav: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee);

    const { pathname } = useLocation();

    const activeLink = (link: string, subroutes: boolean = false): string => {
        const active = subroutes ? pathname.includes(link) : pathname.endsWith(link);
        return active ? 'primary' : 'secondary';
    };

    return (
        <header className={styles.header}>
            <Link to="/committees" data-button-type="ghost" style={{ color: 'var(--color-text' }}>
                <BackArrowIcon />
            </Link>
            <div className={styles.committee}>
                <span>{currentCommittee!.name}</span>
            </div>
            <nav className={styles.nav}>
                <Link to={`/committees/${currentCommittee!.id}/home`} data-button-type={activeLink('/home')}>
                    Overview
                </Link>
                <Link to={`/committees/${currentCommittee!.id}/motions`} data-button-type={activeLink('/motions', true)}>
                    Active Motions
                </Link>
                <Link to={`/committees/${currentCommittee!.id}/past-motions`} data-button-type={activeLink('/past-motions')}>
                    Past Motions
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
