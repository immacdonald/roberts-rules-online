// import type { SocketExec } from '../../../types';
import { FC } from 'react';
import { Page } from '../../components';
import styles from './ActiveMotions.module.scss';

// interface ActiveMotionsProps {
//     socketExec: SocketExec;
// }

const ActiveMotions: FC = () => {
    return (
        <Page>
            <section>
                <header className="">
                    <h1>Active Motions</h1>
                </header>
                <div className=""></div>
            </section>
            <div className={styles.buttonContainer}>
                <button className={styles.createButton} data-button-type="primary">
                    Create New Motion +
                </button>
            </div>
            <table id="activeMotionsTable" className={styles.motionTable}>
                <tr className={styles.motionTableHeader}>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Date</th>
                </tr>
                <tr className={styles.motion}>
                    <th className={styles.motionTitle}>
                        <h3>Motion to do something</h3>
                    </th>
                    <th className={styles.motionAuthor}>Alice</th>
                    <th className={styles.motionDate}>4/20/69</th>
                </tr>
                <tr className={styles.motion}>
                    <th className={styles.motionTitle}>
                        <h3>Motion to do something else</h3>
                    </th>
                    <th className={styles.motionAuthor}>Bob</th>
                    <th className={styles.motionDate}>4/20/69</th>
                </tr>
                <tr className={styles.motion}>
                    <th className={styles.motionTitle}>
                        <h3>Motion to get an A in this class</h3>
                    </th>
                    <th className={styles.motionAuthor}>Alex</th>
                    <th className={styles.motionDate}>10/17/24</th>
                </tr>
            </table>
        </Page>
    );
};

export { ActiveMotions };
