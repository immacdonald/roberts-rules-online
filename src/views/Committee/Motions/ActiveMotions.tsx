import { ChangeEvent, CSSProperties, FC, FormEvent, Fragment, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Toggle from 'react-toggle';
import clsx from 'clsx';
import { MotionData } from 'types';
import { capitalize } from '../../../../utility';
import { Loading, Textbox } from '../../../components';
import { Modal } from '../../../components/Modal';
import { selectCurrentCommittee, setCurrentMotion } from '../../../features/committeesSlice';
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
    const [motionDescription, setMotionDescription] = useState<string>('');
    const [proceduralMotion, setProceduralMotion] = useState<boolean>(false);
    const [specialMotion, setSpecialMotion] = useState<boolean>(false);

    const createMotion = (): void => {
        setCreateModal(true);
    };

    const handleCreateMotion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setCreateModal(false);
        //console.log('Creating new motion:', motionTitle);
        socket!.emit('createMotion', currentCommittee.id!, motionTitle, motionDescription, proceduralMotion ? 'procedural' : specialMotion ? 'special' : null);
    };

    const activeMotions = useMemo(() => {
        return (currentCommittee?.motions || []).filter((motion) => motion.decisionTime > Date.now()).sort((a, b) => b.creationDate - a.creationDate);
    }, [currentCommittee?.motions]);

    const displayMotions = useMemo(() => {
        return activeMotions.map((motion: MotionData) => {
            if (motion.relatedId && motion.flag != 'overturn') {
                return false;
            }

            const submotions = currentCommittee!.motions!.filter((submotion) => submotion.relatedId == motion.id && submotion.flag != 'overturn');

            return (
                <Fragment key={motion.id}>
                    <div className={clsx(styles.row, styles.motion)} onClick={() => navigate(`/committees/${currentCommittee.id}/motions/${motion.id}`)}>
                        <span>
                            {motion.flag && (
                                <b>
                                    <i>{capitalize(motion.flag)}</i>
                                </b>
                            )}
                        </span>
                        <h3>{motion.title || 'Untitled Motion'}</h3>
                        <span>{motion.author || motion.authorId}</span>
                        <span>{motion.creationDate && new Date(motion.creationDate).toLocaleDateString()}</span>
                        <span>{motion.decisionTime && new Date(motion.decisionTime).toLocaleDateString()}</span>
                    </div>
                    {submotions.length > 0 &&
                        submotions.map((submotion) => {
                            return (
                                <div className={clsx(styles.row, styles.submotion)} key={submotion.id} onClick={() => navigate(`/committees/${currentCommittee!.id}/motions/${submotion.id}`)}>
                                    <h3>{submotion.title || 'Untitled Submotion'}</h3>
                                    <span>{submotion.author || submotion.authorId}</span>
                                    <span>{submotion.creationDate && new Date(submotion.creationDate).toLocaleDateString()}</span>
                                    <span>{submotion.decisionTime && new Date(submotion.decisionTime).toLocaleDateString()}</span>
                                </div>
                            );
                        })}
                </Fragment>
            );
        });
    }, [activeMotions]);

    const canMakeSpecialMotion = isFlagged(currentCommittee.flag, specialMotionIndex) || user.role == 'owner' || user.role == 'chair';
    const canMakeProceduralMotion = isFlagged(currentCommittee.flag, proceduralMotionIndex) || user.role == 'owner' || user.role == 'chair';

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setCurrentMotion(null));
    }, []);

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
                    activeMotions.length > 0 ? (
                        <div className={styles.motionTable} style={{ '--table-layout': '100px 1fr 100px 140px 100px', '--table-submotion-layout': '1fr 100px 140px 100px' } as CSSProperties}>
                            <div className={clsx(styles.row, styles.tableHeader)}>
                                <span>Type</span>
                                <span>Title</span>
                                <span>Author</span>
                                <span>Proposed On</span>
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
                            <label htmlFor="motionTitle">Motion Title</label>
                            <input type="text" name="motionTitle" id="motionTitle" required onChange={(ev) => setMotionTitle(ev.target.value)} value={motionTitle} placeholder="Title" />
                        </fieldset>
                        <fieldset>
                            <label htmlFor="motionDescription">Motion Description</label>
                            <Textbox
                                autoResize
                                type="text"
                                name="motionDescription"
                                id="motionDescription"
                                required
                                onChange={(ev: ChangeEvent<HTMLTextAreaElement>) => setMotionDescription(ev.target.value)}
                                value={motionDescription}
                                placeholder="Description..."
                            />
                        </fieldset>
                        {(canMakeSpecialMotion || canMakeProceduralMotion) && (
                            <div className={styles.toggles}>
                                {canMakeSpecialMotion && (
                                    <div>
                                        <span>Special Motion</span>
                                        <Toggle
                                            icons={false}
                                            checked={specialMotion}
                                            onChange={(event: ChangeEvent<HTMLInputElement>) => setSpecialMotion(event.target.checked)}
                                            disabled={proceduralMotion}
                                        />
                                    </div>
                                )}
                                {canMakeProceduralMotion && (
                                    <div>
                                        <span>Procedural Motion</span>
                                        <Toggle
                                            icons={false}
                                            checked={proceduralMotion}
                                            onChange={(event: ChangeEvent<HTMLInputElement>) => setProceduralMotion(event.target.checked)}
                                            disabled={specialMotion}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        <Modal.Actions>
                            <button type="button" onClick={() => setCreateModal(false)} data-button-type="secondary">
                                Cancel
                            </button>
                            <button type="submit" id="createButton" data-button-type="primary" disabled={motionTitle.length == 0 || motionDescription.length == 0}>
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
