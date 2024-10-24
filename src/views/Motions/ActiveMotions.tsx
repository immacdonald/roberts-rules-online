import type { SocketExec } from '../../../types';
import { FC, FormEvent, useState } from 'react';
import { Page } from '../../components';
import styles from './ActiveMotions.module.scss';

interface ActiveMotionsProps {
    socketExec: SocketExec;
}

const ActiveMotions: FC<ActiveMotionsProps> = ({ socketExec }) => {
    const [createModal, setCreateModal] = useState<boolean>(false);

    const [motionTitle, setMotionTitle] = useState<string>('');

    const createMotion = () => {
        console.log('Create a new motion');
        setCreateModal(true);
    };

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

    const handleCreateMotion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Creating new motion:', motionTitle, 'John Doe');
        // Create the committee
        socketExec('createCommittee', motionTitle, 'John Doe');
    };

    return (
        <>
            <Page>
                <section>
                    <header className="">
                        <h1>Active Motions</h1>
                    </header>
                    <div className=""></div>
                    <div className={styles.buttonContainer}>
                        <button className={styles.createButton} data-button-type="primary" onClick={() => createMotion()}>
                            Create New Motion +
                        </button>
                    </div>
                    <table id="activeMotionsTable" className={styles.motionTable}>
                        <tr className={styles.motionTableHeader}>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Date</th>
                        </tr>
                        {populateMotions()}
                    </table>
                </section>
            </Page>
            {createModal && (
                <div className={styles.modal}>
                    <div>
                        <h2>Create New Motion</h2>
                        <form id="createMotion" onSubmit={handleCreateMotion}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="committeeName">Motion Title</label>
                                <input type="text" name="motionTitle" id="motionTitle" required={true} onChange={(ev) => setMotionTitle(ev.target.value)} value={motionTitle} />
                            </div>
                            <div className={styles.modalFooter}>
                                <button onClick={() => setCreateModal(false)}>Cancel</button>
                                <button type="submit" id="createButton" data-button-type="primary">
                                    Create Motion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export { ActiveMotions };
