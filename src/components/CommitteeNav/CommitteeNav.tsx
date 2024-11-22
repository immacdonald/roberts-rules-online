import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { CommitteeMember } from '../../../types';
import { BackArrowIcon } from '../../assets/icons';
import { selectCurrentCommittee } from '../../features/committeesSlice';
import { selectUser } from '../../features/userSlice';
import styles from './CommitteeNav.module.scss';

const CommitteeNav: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee)!;
    const { id } = useSelector(selectUser)!;

    const user = useMemo(() => currentCommittee.members.find((member: CommitteeMember) => member.id == id)!, [id, currentCommittee]);

    const { pathname } = useLocation();

    const activeLink = (link: string, subroutes: boolean = false): string => {
        const active = subroutes ? pathname.includes(link) : pathname.endsWith(link);
        return active ? 'primary' : 'secondary';
    };

    return (
        <header className={styles.header}>
            <div className={styles.committee}>
                <Link to="/committees" data-button-type="ghost" style={{ color: 'var(--color-text' }}>
                    <BackArrowIcon />
                </Link>
                <span>{currentCommittee.name}</span>
            </div>
            <nav className={styles.nav}>
                <Link to={`/committees/${currentCommittee.id}/home`} data-button-type={activeLink('/home')}>
                    Overview
                </Link>
                <Link to={`/committees/${currentCommittee.id}/motions`} data-button-type={activeLink('/motions', true)}>
                    Motions
                </Link>
                <Link to={`/committees/${currentCommittee.id}/past-motions`} data-button-type={activeLink('/past-motions')}>
                    Previous Motions
                </Link>
                <Link to={`/committees/${currentCommittee.id}/users`} data-button-type={activeLink('/users')}>
                    Members
                </Link>
                {(user.role == 'owner' || user.role == 'chair') && (
                    <Link to={`/committees/${currentCommittee.id}/control-panel`} data-button-type={activeLink('/control-panel')}>
                        Control Panel
                    </Link>
                )}
            </nav>
        </header>
    );
};

export { CommitteeNav };
