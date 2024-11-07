import React, {FC, ReactNode} from 'react';
import styles from './Motions.module.scss';

const PastMotions: FC = () => {
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

    const populateMotions = () : ReactNode => {
        return (
            <>
                {getMotion('Motion to do something', 'Alice', '2015/03/12')}
                {getMotion('Motion to do something else', 'Bob', '2023/02/10')}
                {getMotion('Motion to get an A in this class', 'Alex', '2024/10/24')}
            </>
        );
    };

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
                    <tbody>{populateMotions()}</tbody>
                </table>
            </section>
        </>
    );
};

export { PastMotions };
