import { CSSProperties, FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { MotionData, Vote } from 'types';
import { capitalize } from '../../../../utility';
import { RetryIcon } from '../../../assets/icons';
import { Loading } from '../../../components';
import { selectCurrentCommittee } from '../../../features/committeesSlice';
import { selectUser } from '../../../features/userSlice';
import styles from './Motions.module.scss';

const PastMotions: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee)!;

    const [viewPassedMotions, setViewPassedMotions] = useState<boolean | null>(null);

    const pastMotions = useMemo(() => {
        if (currentCommittee && currentCommittee.motions) {
            return currentCommittee.motions.filter((motion: MotionData) => motion.status != 'open' || motion.decisionTime < Date.now());
        } else {
            return [];
        }
    }, [currentCommittee?.motions, viewPassedMotions]);

    const filteredPastMotions = useMemo(() => {
        if (viewPassedMotions !== null) {
            return pastMotions.filter((motion) => motion.status == (viewPassedMotions ? 'passed' : 'failed'));
        }
        return pastMotions;
    }, [pastMotions, viewPassedMotions]);

    const overturnMotion = (motionId: string): void => {
        console.log('Overturning motion with id', motionId);
    };

    const displayMotions = useMemo(() => {
        return currentCommittee.motions!.map((motion: MotionData) => {
            return (
                <div
                    className={clsx(styles.row, styles.motion)}
                    key={motion.id}
                    onClick={() => navigate(`/committees/${currentCommittee.id}/past-motions/${motion.id}`)}
                    data-motion-status={motion.status}
                >
                    {votedWithThisMotion && motion.flag == '' ? (
                        <button
                            disabled={motion.status == 'open'}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                event.stopPropagation();
                                overturnMotion(motion.id);
                            }}
                        >
                            <RetryIcon />
                        </button>
                    ) : (
                        <span />
                    )}
                    <h3>{motion.title}</h3>
                    <span>{motion.author || motion.authorId}</span>
                    <span>
                        <b>
                            <i>{capitalize(motion.status == 'open' ? 'pending' : motion.status)}</i>
                        </b>
                    </span>
                    <span>{motion.creationDate && new Date(motion.creationDate).toLocaleDateString()}</span>
                </div>
            );
        });
    }, [currentCommittee?.motions]);

    const pastMotions = useMemo(() => {
        if (currentCommittee && currentCommittee.motions) {
            return currentCommittee.motions.filter((motion: MotionData) => motion.status != 'pending');
        } else {
            return [];
        }
    }, [currentCommittee?.motions]);

    return (
        <>
            <section>
                <header className={styles.header}>
                    <h1>Past Motions</h1>
                    <div className={styles.filter}>
                        <button
                            className={viewPassedMotions === true ? styles.selected : undefined}
                            onClick={() => setViewPassedMotions(viewPassedMotions === true ? null : true)}
                            disabled={!(pastMotions.length > 0)}
                        >
                            Passed
                        </button>
                        <button
                            className={viewPassedMotions === false ? styles.selected : undefined}
                            onClick={() => setViewPassedMotions(viewPassedMotions === false ? null : false)}
                            disabled={!(pastMotions.length > 0)}
                        >
                            Failed
                        </button>
                    </div>
                </header>
                {currentCommittee?.motions ? (
                    pastMotions.length > 0 ? (
                        <div className={styles.motionTable} style={{ '--table-layout': '100px 1fr 200px 200px 160px' } as CSSProperties}>
                            <div className={clsx(styles.row, styles.tableHeader)}>
                                <span>Overturn</span>
                                <span>Title</span>
                                <span>Author</span>
                                <span>Status</span>
                                <span>Proposed On</span>
                            </div>
                            {displayMotions}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <p>No motions have been voted on yet.</p>
                        </div>
                    )
                ) : (
                    <Loading />
                )}
            </section>
        </>
    );
};

export { PastMotions };
