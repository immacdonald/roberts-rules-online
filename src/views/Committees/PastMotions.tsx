import { FC, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MotionData } from 'types';
import { selectCurrentCommittee } from '../../features/committeesSlice';
import styles from './Motions.module.scss';
import { Loading } from '../../components';

const PastMotions: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee);

    const getMotion = (title: string, name: string, date?: string): ReactNode => {
        let dateString;
        if (date === undefined) {
            const currentDate = new Date();
            dateString = currentDate.toISOString().slice(0, 10);
        } else dateString = date;

        return (
            <tr className={styles.pastMotion} key={title}>
                <th>
                    <div className={styles.buttonContainer}>
                        <button>↩️</button>
                    </div>
                </th>
                <td className={styles.motionTitle}>
                    <h3>{title}</h3>
                </td>
                {/*  TODO: Fill with account's name */}
                <td className={styles.motionAuthor}>{name}</td>
                <td className={styles.motionDate}>{dateString}</td>
            </tr>
        );
    };

    const displayMotions = useMemo(() => {
        return currentCommittee!.motions!.map((motion: MotionData) => {
            return getMotion(motion.title, motion.authorId, '2024/11/14');
        });
    }, [currentCommittee!.motions]);

    return (
        <>
            <section>
                <header className="">
                    <h1>Past Motions</h1>
                </header>
                <div className=""></div>
                <div className={styles.buttonContainer}>
                    <button className={styles.selected}>Passed</button>
                    <button className={styles.notSelected}>Failed</button>
                </div>
                {currentCommittee?.motions ? (
                    <table id="pastMotionsTable" className={styles.motionTable}>
                        <thead>
                            <tr className={styles.pastMotionTableHeader}>
                                <th/>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>{displayMotions}</tbody>
                    </table>
                ) : (
                    <Loading />
                )}
            </section>
        </>
    );
};

export { PastMotions };
