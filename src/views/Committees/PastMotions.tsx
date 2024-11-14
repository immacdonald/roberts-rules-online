import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import styles from './Motions.module.scss';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';
import { MotionData } from 'types';

const PastMotions: FC = () => {
    const { currentCommittee } = useWebsiteContext();

    const getMotion = (title: string, name: string, date?: string): ReactNode => {
        let dateString;
        if (date === undefined) {
            const currentDate = new Date();
            dateString = currentDate.toISOString().slice(0, 10);
        } else dateString = date;

        return (
            <tr className={styles.pastMotion}>
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
        console.log(currentCommittee);
        if (currentCommittee!.motions.length > 0) {
            return currentCommittee!.motions.map((motion: MotionData) => {
                return getMotion(motion.title, motion.authorId, '2024/11/14');
            })
        } else {
            return (
                <>
                    {getMotion('Motion to do something', 'Alice', '2015/03/12')}
                    {getMotion('Motion to do something else', 'Bob', '2023/02/10')}
                    {getMotion('Motion to get an A in this class', 'Alex', '2024/10/24')}
                </>
            );
        }
    }, [currentCommittee!.motions])

    useEffect(() => {
        console.log(currentCommittee);
    }, [currentCommittee])

    return (
        <>
            <section>
                <header className="">
                    <h1>Past Motions</h1>
                </header>
                <div className=""></div>
                <div className={styles.buttonContainer}>
                    <button className={styles.selected}>
                        Passed
                    </button>
                    <button className={styles.notSelected}>
                        Failed
                    </button>
                </div>
                <table id="pastMotionsTable" className={styles.motionTable}>
                    <thead>
                        <tr className={styles.pastMotionTableHeader}>
                            <td></td>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>{displayMotions}</tbody>
                </table>
            </section>
        </>
    );
};

export { PastMotions };
