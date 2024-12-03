import { CSSProperties, FC, FormEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { MotionData } from 'types';
import { Loading } from '../../../components';
import { Modal } from '../../../components/Modal';
import { selectCurrentCommittee } from '../../../features/committeesSlice';
import { socket } from '../../../socket';
import styles from './Motions.module.scss';

const ActiveMotions: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee);
    const navigate = useNavigate();
    const [createModal, setCreateModal] = useState<boolean>(false);

    const [motionTitle, setMotionTitle] = useState<string>('');
    const [motionDesc, setMotionDesc] = useState<string>('');

    const createMotion = (): void => {
        console.log('Create a new motion');
        setCreateModal(true);
    };

    const handleCreateMotion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setCreateModal(false);
        console.log('Creating new motion:', motionTitle, motionDesc);
        socket!.emit('createMotion', currentCommittee!.id!, motionTitle, motionDesc);
    };

    const displayMotions = useMemo(() => {
        return currentCommittee!.motions!.map((motion: MotionData) => {
            return (
                <div className={clsx(styles.row, styles.motion)} key={motion.title} onClick={() => navigate(`/committees/${currentCommittee!.id}/motions/${motion.id}`)}>
                    <h3>{motion.title}</h3>
                    <span>{motion.author || motion.authorId}</span>
                    <span>{motion.creationDate && new Date(motion.creationDate).toLocaleDateString()}</span>
                    <span>{motion.decisionTime && new Date(motion.decisionTime).toLocaleDateString()}</span>
                </div>
            );
        });
    }, [currentCommittee?.motions]);

    return (
        <>
            <section>
                <header className={styles.header}>
                    <h1>Active Motions</h1>
                    <button className={styles.createButton} data-button-type="primary" onClick={() => createMotion()}>
                        Create New Motion +
                    </button>
                </header>
                {currentCommittee?.motions ? (
                    currentCommittee!.motions.length > 0 ? (
                        <div className={styles.motionTable} style={{ '--table-layout': '1fr 200px 200px 200px' } as CSSProperties}>
                            <div className={clsx(styles.row, styles.tableHeader)}>
                                <span>Title</span>
                                <span>Author</span>
                                <span>Date</span>
                                <span>Vote By</span>
                            </div>
                            {displayMotions}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <p>No motions are currently active.</p>
                        </div>
                    )
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
                        <fieldset>
                            <label htmlFor="password">Motion Description</label>
                            <input type="text" id="motionDesc" required={true} onChange={(ev) => setMotionDesc(ev.target.value)} value={motionDesc} />
                        </fieldset>
                        <Modal.Actions>
                            <button type="button" onClick={() => setCreateModal(false)} data-button-type="secondary">
                                Cancel
                            </button>
                            <button type="submit" id="createButton" data-button-type="primary">
                                Create Motion
                            </button>
                        </Modal.Actions>
                    </form>
                </Modal>
            )}
        </>
    );
};

export { ActiveMotions };
