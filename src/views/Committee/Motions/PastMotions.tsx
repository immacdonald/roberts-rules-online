import { ChangeEvent, CSSProperties, FC, FormEvent, Fragment, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { MotionData, Vote } from 'types';
import { capitalize } from '../../../../utility';
import { RetryIcon } from '../../../assets/icons';
import { Loading, Textbox } from '../../../components';
import { Modal } from '../../../components/Modal';
import { selectCurrentCommittee, setCurrentMotion } from '../../../features/committeesSlice';
import { selectUser } from '../../../features/userSlice';
import { socket } from '../../../socket';
import styles from './Motions.module.scss';

const PastMotions: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee)!;
    const { id } = useSelector(selectUser)!;
    const navigate = useNavigate();

    const [viewPassedMotions, setViewPassedMotions] = useState<boolean | null>(null);

    const pastMotions = useMemo(() => {
        if (currentCommittee && currentCommittee.motions) {
            return currentCommittee.motions.filter((motion: MotionData) => motion.status != 'open' || motion.decisionTime < Date.now()).sort((a, b) => b.decisionTime - a.decisionTime);
        } else {
            return [];
        }
    }, [currentCommittee?.motions, viewPassedMotions]);

    const filteredPastMotions = useMemo(() => {
        if (viewPassedMotions !== null) {
            return pastMotions.filter((motion) => motion.status == (viewPassedMotions ? 'passed' : 'failed'));
        }
        return pastMotions;
    }, [pastMotions, viewPassedMotions]);

    const [createModal, setCreateModal] = useState<boolean>(false);

    const [submotionDesc, setSubmotionDesc] = useState<string>('');
    const [overturnMotionId, setOverturnMotionId] = useState<string>('');

    const overturnMotion = (id: string): void => {
        setOverturnMotionId(id);
        setCreateModal(true);
    };

    const handleCreateSubmotion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setCreateModal(false);
        socket!.emit('createMotion', currentCommittee.id, `Overturn ${currentCommittee.motions?.find((motion) => motion.id == overturnMotionId)!.title}`, submotionDesc, 'overturn', overturnMotionId);
    };

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setCurrentMotion(null));
    }, []);

    const displayMotions = useMemo(() => {
        return filteredPastMotions.map((motion: MotionData) => {
            if (motion.relatedId && motion.flag != 'overturn') {
                return false;
            }

            const vote: Vote | null = motion.vote[id] ?? null;
            const votedWithThisMotion = vote && vote == 'yea' && motion.status == 'passed';

            const submotions = currentCommittee!.motions!.filter((submotion) => submotion.relatedId == motion.id && submotion.flag != 'overturn');

            return (
                <Fragment key={motion.id}>
                    <div className={clsx(styles.row, styles.motion)} onClick={() => navigate(`/committees/${currentCommittee.id}/past-motions/${motion.id}`)} data-motion-status={motion.status}>
                        {votedWithThisMotion && motion.flag == '' && !currentCommittee.motions!.some((m) => m.relatedId == motion.id && m.flag == 'overturn') ? (
                            <button
                                disabled={motion.status == 'open'}
                                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                    event.stopPropagation();
                                    overturnMotion(motion.id);
                                }}
                            >
                                <RetryIcon />
                            </button>
                        ) : (
                            <span />
                        )}
                        <h3>{motion.title || 'Untitled Motion'}</h3>
                        <span>{motion.author || motion.authorId}</span>
                        <span>
                            <b>
                                <i>{capitalize(motion.status == 'open' ? 'pending' : motion.status)}</i>
                            </b>
                        </span>
                        <span>{motion.decisionTime && new Date(motion.decisionTime).toLocaleDateString()}</span>
                    </div>
                    {submotions.length > 0 &&
                        submotions.map((submotion) => {
                            return (
                                <div className={clsx(styles.row, styles.submotion)} key={submotion.id} onClick={() => navigate(`/committees/${currentCommittee!.id}/motions/${submotion.id}`)}>
                                    <h3>{submotion.title || 'Untitled Submotion'}</h3>
                                    <span>{submotion.author || submotion.authorId}</span>
                                    <span>
                                        <b>
                                            <i>{capitalize(submotion.status == 'open' ? 'pending' : submotion.status)}</i>
                                        </b>
                                    </span>
                                    <span>{submotion.decisionTime && new Date(submotion.decisionTime).toLocaleDateString()}</span>
                                </div>
                            );
                        })}
                </Fragment>
            );
        });
    }, [filteredPastMotions]);

    return (
        <>
            <section>
                <header className={styles.header}>
                    <h1>Past Motions</h1>
                    <div className={styles.filter}>
                        <button
                            className={viewPassedMotions === true ? styles.selected : undefined}
                            onClick={() => setViewPassedMotions(viewPassedMotions === true ? null : true)}
                            disabled={!(pastMotions.length > 0)}
                        >
                            Passed
                        </button>
                        <button
                            className={viewPassedMotions === false ? styles.selected : undefined}
                            onClick={() => setViewPassedMotions(viewPassedMotions === false ? null : false)}
                            disabled={!(pastMotions.length > 0)}
                        >
                            Failed
                        </button>
                    </div>
                </header>
                {currentCommittee?.motions ? (
                    pastMotions.length > 0 ? (
                        <div className={styles.motionTable} style={{ '--table-layout': '100px 1fr 200px 200px 160px', '--table-submotion-layout': '1fr 200px 200px 160px' } as CSSProperties}>
                            <div className={clsx(styles.row, styles.tableHeader)}>
                                <span>Overturn</span>
                                <span>Title</span>
                                <span>Author</span>
                                <span>Status</span>
                                <span>Decided</span>
                            </div>
                            {displayMotions}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <p>No motions have been voted on yet.</p>
                        </div>
                    )
                ) : (
                    <Loading />
                )}
            </section>
            {createModal && (
                <Modal>
                    <h2>Overturn {currentCommittee.motions?.find((motion) => motion.id == overturnMotionId)!.title}</h2>
                    <form id="createSubmotion" onSubmit={handleCreateSubmotion}>
                        <fieldset>
                            <label htmlFor="password">Reason</label>
                            <Textbox autoResize id="submotionDesc" onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setSubmotionDesc(event.target.value)} value={submotionDesc} />
                        </fieldset>
                        <Modal.Actions>
                            <button type="button" onClick={() => setCreateModal(false)} data-button-type="secondary">
                                Cancel
                            </button>
                            <button type="submit" id="createButton" data-button-type="primary">
                                Create Submotion
                            </button>
                        </Modal.Actions>
                    </form>
                </Modal>
            )}
        </>
    );
};

export { PastMotions };
