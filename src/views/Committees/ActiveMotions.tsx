import { FC, FormEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MotionData } from 'types';
import { Modal } from '../../components/Modal';
import { selectCurrentCommittee } from '../../features/committeesSlice';
import { socket } from '../../socket';
import styles from './Motions.module.scss';
import { Loading } from '../../components';

const ActiveMotions: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee);
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
            <tr className={styles.motion} key={title}>
                <th className={styles.motionTitle}>
                    <h3>{title}</h3>
                </th>
                <th className={styles.motionAuthor}>{name}</th>
                <th className={styles.motionDate}>{dateString}</th>
            </tr>
        );
    };

    const displayMotions = useMemo(() => {
        return currentCommittee!.motions!.map((motion: MotionData) => {
            return getMotion(motion.title, motion.authorId, '2024/11/14');
        });
    }, [currentCommittee!.motions]);

    const handleCreateMotion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Creating new motion:', motionTitle, 'John Doe');
        // Create the committee
        socket!.emit('createMotion', currentCommittee!.id!, motionTitle);
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
                {currentCommittee?.motions ? (
                    <table id="activeMotionsTable" className={styles.motionTable}>
                        <thead>
                            <tr className={styles.motionTableHeader}>
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
