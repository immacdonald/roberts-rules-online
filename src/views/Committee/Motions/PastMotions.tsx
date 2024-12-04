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
    const { id } = useSelector(selectUser)!;
    const navigate = useNavigate();

    const enum PastMotionStatus {
        All,
        Pending,
        Passed,
        Failed
    }

    const [viewPassedMotions, setViewPassedMotions] = useState<PastMotionStatus>(PastMotionStatus.All);

    const pastMotions = useMemo(() => {
        if (currentCommittee && currentCommittee.motions) {
            return currentCommittee.motions.filter((motion: MotionData) => motion.status != 'open' || motion.decisionTime < Date.now());
        } else {
            return [];
        }
    }, [currentCommittee?.motions, viewPassedMotions]);

    const filteredPastMotions = useMemo(() => {
        switch (viewPassedMotions) {
            case PastMotionStatus.All:
                return pastMotions;
            case PastMotionStatus.Pending:
                return pastMotions.filter((motion) => motion.status == 'open');
            case PastMotionStatus.Passed:
                return pastMotions.filter((motion) => motion.status == 'passed');
            case PastMotionStatus.Failed:
                return pastMotions.filter((motion) => motion.status == 'failed');
            default:
                return pastMotions;
        }
    }, [pastMotions, viewPassedMotions]);

    const overturnMotion = (motionId: string): void => {
        console.log('Overturning motion with id', motionId);
    };

    const displayMotions = useMemo(() => {
        return filteredPastMotions.map((motion: MotionData) => {
            const vote: Vote | null = motion.vote[id] ?? null;
            let votedWithThisMotion = false;
            if (vote && (motion.status == 'passed' || motion.status == 'failed')) {
                votedWithThisMotion = (vote == 'yea' && motion.status == 'passed') || (vote == 'nay' && motion.status == 'failed');
            }
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
    }, [filteredPastMotions]);

    return (
        <>
            <section>
                <header className={styles.header}>
                    <h1>Past Motions</h1>
                    <div className={styles.filter}>
                        <button
                            className={viewPassedMotions === PastMotionStatus.All ? styles.selected : undefined}
                            onClick={() => setViewPassedMotions(PastMotionStatus.All)}
                            disabled={!(pastMotions.length > 0)}
                        >
                            All
                        </button>
                        <button
                            className={viewPassedMotions === PastMotionStatus.Pending ? styles.selected : undefined}
                            onClick={() => setViewPassedMotions(PastMotionStatus.Pending)}
                            disabled={!(pastMotions.length > 0)}
                        >
                            Pending
                        </button>
                        <button
                            className={viewPassedMotions === PastMotionStatus.Passed ? styles.selected : undefined}
                            onClick={() => setViewPassedMotions(PastMotionStatus.Passed)}
                            disabled={!(pastMotions.length > 0)}
                        >
                            Passed
                        </button>
                        <button
                            className={viewPassedMotions === PastMotionStatus.Failed ? styles.selected : undefined}
                            onClick={() => setViewPassedMotions(PastMotionStatus.Failed)}
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
