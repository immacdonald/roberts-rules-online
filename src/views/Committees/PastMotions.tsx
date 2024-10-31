import { FC } from 'react';
import { Page } from '../../components';
import { CommitteeNav } from '../../components/CommitteeNav';
import styles from './ActiveMotions.module.scss';

const PastMotions: FC = () => {
    const getMotion = (title: string, name: string, date?: string) => {
        let dateString;
        if (date === undefined) {
            const currentDate = new Date();
            dateString = currentDate.toISOString().slice(0, 10);
        } else dateString = date;

        return (
            <tr className={styles.motion}>
                <th className={styles.motionTitle}>
                    <h3>{title}</h3>
                </th>
                {/*  TODO: Fill with account's name */}
                <th className={styles.motionAuthor}>{name}</th>
                <th className={styles.motionDate}>{dateString}</th>
            </tr>
        );
    };

    const populateMotions = () => {
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
            <Page>
                <CommitteeNav />
                <section>
                    <header className="">
                        <h1>Past Motions</h1>
                    </header>
                    <div className=""></div>
                    <table id="activeMotionsTable" className={styles.motionTable}>
                        <thead>
                            <tr className={styles.motionTableHeader}>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>{populateMotions()}</tbody>
                    </table>
                </section>
            </Page>
        </>
    );
};

export { PastMotions };
