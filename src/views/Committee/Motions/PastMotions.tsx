import { CSSProperties, FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { MotionData } from 'types';
import { Loading } from '../../../components';
import { selectCurrentCommittee } from '../../../features/committeesSlice';
import styles from './Motions.module.scss';

const PastMotions: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee);

    const [viewPassedMotions, setViewPassedMotions] = useState<boolean>(true);

    const displayMotions = useMemo(() => {
        return currentCommittee!.motions!.map((motion: MotionData) => {
            return (
                <div className={clsx(styles.row, styles.motion)} key={motion.title}>
                    <button>↩️</button>
                    <h3>{motion.title}</h3>
                    <span>{motion.authorId}</span>
                    <span>{motion.creationDate && new Date(motion.creationDate).toISOString().slice(0, 10)}</span>
                </div>
            );
        });
    }, [currentCommittee?.motions]);

    return (
        <>
            <section>
                <header className={styles.header}>
                    <h1>Past Motions</h1>
                    <div className={styles.filter}>
                        <button className={viewPassedMotions ? styles.selected : undefined} onClick={() => setViewPassedMotions(true)} disabled={!(currentCommittee?.motions?.length || 0 > 0)}>
                            Passed
                        </button>
                        <button className={viewPassedMotions ? undefined : styles.selected} onClick={() => setViewPassedMotions(false)} disabled={!(currentCommittee?.motions?.length || 0 > 0)}>
                            Failed
                        </button>
                    </div>
                </header>
                {currentCommittee?.motions ? (
                    currentCommittee!.motions.length > 0 ? (
                        <div className={styles.motionTable} style={{ '--table-layout': '72px 1fr 200px 200px' } as CSSProperties}>
                            <div className={clsx(styles.row, styles.tableHeader)}>
                                <span>Revote</span>
                                <span>Title</span>
                                <span>Author</span>
                                <span>Date</span>
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
