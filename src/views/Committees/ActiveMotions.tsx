import { FC, FormEvent, useState } from 'react';
import { Modal } from '../../components/Modal';
import { socket } from '../../socket';
import styles from './Motions.module.scss';

const ActiveMotions: FC = () => {
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

        // socket.on('setMotions', (data: any) => {
        //
        // });
        // socket.emit('getMotions'); // to be implemented, make sure that when the setMotions event is called it updates in real time
        return (
            <>
                {getMotion('MotionVote to do something', 'Alice', '2015/03/12')}
                {getMotion('MotionVote to do something else', 'Bob', '2023/02/10')}
                {getMotion('MotionVote to get an A in this class', 'Alex', '2024/10/24')}
            </>
        );
    };

    const handleCreateMotion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Creating new motion:', motionTitle, 'John Doe');
        // Create the committee
        socket.emit('createCommittee', motionTitle, 'John Doe');
    };

    return (
        <>
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
            {createModal && (
                <Modal>
                    <h2>Create New Motion</h2>
                    <form id="createMotion" onSubmit={handleCreateMotion}>
                        <fieldset>
                            <label htmlFor="committeeName">Motion Title</label>
                            <input type="text" name="motionTitle" id="motionTitle" required={true} onChange={(ev) => setMotionTitle(ev.target.value)} value={motionTitle} />
                        </fieldset>
                        <div className={styles.actions}>
                            <button onClick={() => setCreateModal(false)} data-button-type="secondary">
                                Cancel
                            </button>
                            <button type="submit" id="createButton" data-button-type="primary">
                                Create Motion
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

export { ActiveMotions };
