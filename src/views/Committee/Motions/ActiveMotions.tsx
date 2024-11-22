import { ChangeEvent, CSSProperties, FC, FormEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Toggle from 'react-toggle';
import clsx from 'clsx';
import { MotionData } from 'types';
import { capitalize } from '../../../../utility';
import { Loading, Textbox } from '../../../components';
import { Modal } from '../../../components/Modal';
import { selectCurrentCommittee } from '../../../features/committeesSlice';
import { selectUser } from '../../../features/userSlice';
import { isFlagged } from '../../../flags';
import { socket } from '../../../socket';
import styles from './Motions.module.scss';

const specialMotionIndex = 0;
const proceduralMotionIndex = 1;

const ActiveMotions: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee)!;
    const navigate = useNavigate();
    const [createModal, setCreateModal] = useState<boolean>(false);
    const { id } = useSelector(selectUser)!;
    const user = useMemo(() => currentCommittee.members.find((member) => member.id == id)!, [id, currentCommittee]);

    const [motionTitle, setMotionTitle] = useState<string>('');
    const [motionDesc, setMotionDesc] = useState<string>('');

    const createMotion = (): void => {
        setCreateModal(true);
    };

    const handleCreateMotion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setCreateModal(false);
        console.log('Creating new motion:', motionTitle);
        socket!.emit('createMotion', currentCommittee.id!, motionTitle);
    };

    const activeMotions = useMemo(() => {
        return (currentCommittee?.motions || []).filter((motion) => motion.decisionTime > Date.now());
    }, [currentCommittee?.motions]);

    const displayMotions = useMemo(() => {
        return currentCommittee.motions!.map((motion: MotionData) => {
            return (
                <div className={clsx(styles.row, styles.motion)} key={motion.title} onClick={() => navigate(`/committees/${currentCommittee.id}/motions/${motion.id}`)}>
                    <h3>{motion.title}</h3>
                    <span>{motion.author || motion.authorId}</span>
                    <span>{motion.creationDate && new Date(motion.creationDate).toLocaleDateString()}</span>
                    <span>{motion.decisionTime && new Date(motion.decisionTime).toLocaleDateString()}</span>
                </div>
            );
        });
    }, [activeMotions]);

    const canMakeSpecialMotion = isFlagged(currentCommittee.flag, specialMotionIndex) || user.role == 'owner' || user.role == 'chair';
    const canMakeProceduralMotion = isFlagged(currentCommittee.flag, proceduralMotionIndex) || user.role == 'owner' || user.role == 'chair';

    const displaySubmotions = useMemo(() => {
        return currentCommittee!.motions!.map((motion: MotionData) => {
            return (
                <div className={clsx(styles.row, styles.submotion)} key={motion.title} onClick={() => navigate(`/committees/${currentCommittee!.id}/motions/${motion.id}`)}>
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
                    currentCommittee.motions.length > 0 ? (
                        <div className={styles.motionTable} style={{ '--table-layout': '1fr 200px 200px 200px' } as CSSProperties}>
                            <div className={clsx(styles.row, styles.tableHeader)}>
                                <span>Type</span>
                                <span>Title</span>
                                <span>Author</span>
                                <span>Proposed On</span>
                                <span>Vote By</span>
                            </div>
                            {displayMotions}
                            {displaySubmotions}
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
                            <label htmlFor="motionTitle">Motion Title</label>
                            <input type="text" name="motionTitle" id="motionTitle" required onChange={(ev) => setMotionTitle(ev.target.value)} value={motionTitle} placeholder="Title" />
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
