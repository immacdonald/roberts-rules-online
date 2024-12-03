import { ChangeEvent, FC, FormEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MotionComment } from '../../../types';
import { capitalize } from '../../../utility';
import { Textbox } from '../../components';
import { Modal } from '../../components/Modal';
import { VoteDisplay } from '../../components/Vote';
import { selectCurrentCommittee, selectCurrentMotion } from '../../features/committeesSlice';
import { selectUser } from '../../features/userSlice';
import { socket } from '../../socket';
import styles from './Motion.module.scss';

const MotionArchive: FC = () => {
    const committee = useSelector(selectCurrentCommittee)!;
    const motion = useSelector(selectCurrentMotion)!;
    const { id } = useSelector(selectUser)!;
    const user = useMemo(() => committee.members.find((member) => member.id == id)!, [id, committee]);

    // Sorts from oldest to newest
    const sortedComments = useMemo(() => {
        if (!motion?.comments) return [];
        return [...motion.comments].sort((a, b) => b.creationDate - a.creationDate);
    }, [motion.comments]);

    const votesInFavor = useMemo(() => {
        return Object.values(motion.vote).filter((vote) => vote == 'yea').length;
    }, [motion]);

    const votesAgainst = useMemo(() => {
        return Object.values(motion.vote).filter((vote) => vote == 'nay').length;
    }, [motion]);

    const [createSummaryModal, setCreateSummaryModal] = useState<boolean>(false);
    // Chair write-up fields
    const [summary, setSummary] = useState<string>('');
    const [pros, setPros] = useState<string>('');
    const [cons, setCons] = useState<string>('');

    const writeSummary = (): void => {
        setCreateSummaryModal(true);
    };

    const calculateIfMotionPassed = (): boolean => {
        return votesInFavor >= motionThreshold;
    };
    const [passed] = useState<boolean>(calculateIfMotionPassed());

    const handleAddDiscusion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Adding summary for motion');
        socket!.emit('setMotionSummary', motion.committeeId, motion.id, passed, summary, pros, cons);
        setCreateSummaryModal(false);
    };

    return (
        <section>
            <div className={styles.motionContainer}>
                <div>
                    {motion.status == 'passed' || motion.status == 'failed' ? (
                        <>
                            <div className={styles.comment} data-comment-type={motion.status == 'passed' ? 'positive' : 'negative'} style={{ textAlign: 'center' }}>
                                <p>
                                    Motion <b>{motion.status == 'passed' ? 'has successfully passed' : 'failed to pass'}</b> with <b>{votesInFavor}</b> votes in favor and <b>{votesAgainst}</b> votes
                                    against.
                                </p>
                            </div>
                            <br />
                        </>
                    ) : (
                        <>
                            <div className={styles.comment} data-comment-type="neutral" style={{ textAlign: 'center' }}>
                                <p>Motion is awaiting final tallying of votes by the chair.</p>
                            </div>
                            <br />
                        </>
                    )}
                    <div className={styles.info}>
                        <b>{motion.author || motion.authorId}</b>
                        <span>Created {new Date(motion.creationDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.overview}>
                        <div>
                            <header className={styles.title}>
                                <h1>{motion.title}</h1>
                                {motion.flag.length > 0 && <span>{capitalize(motion.flag)}</span>}
                            </header>
                            <p>{motion.description || 'No motion description provided.'}</p>
                            <br />
                            <div style={{ marginTop: 'auto' }}>
                                <div className={styles.cancelVote}>
                                    <span>Voting ended {new Date(motion.decisionTime).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <VoteDisplay yeas={votesInFavor} nays={votesAgainst} threshold={Math.ceil(committee.members.length / 2)} totalUsers={committee.members.length} />
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <div className={styles.discusionBox}>
                <h3>Discusion Summary</h3>
                {!motion.summary ? (
                    user.role == 'owner' || user.role == 'chair' ? (
                        <button onClick={() => writeSummary()} data-button-type="secondary">
                            Write Summary
                        </button>
                    ) : (
                        <p> No summary has been written yet, please check again later.</p>
                    )
                ) : (
                    <>
                        <h4>Overall</h4>
                        <p>{motion.summary.summary}</p>
                        <h5>Pros</h5>
                        <p>{motion.summary.pros}</p>
                        <h5>Cons</h5>
                        <p>{motion.summary.cons}</p>
                    </>
                )}
            </div>
            <hr />
            <h3>Archived Discussion</h3>
            {sortedComments.length > 0 ? (
                <div className={styles.comments}>
                    {sortedComments
                        .filter((comment: MotionComment) => !comment.parentCommentId)
                        .map((comment: MotionComment) => {
                            const replies = sortedComments.filter((reply: MotionComment) => comment.id == reply.parentCommentId).reverse();

                            return (
                                <div key={comment.id} className={styles.commentContainer}>
                                    <div className={styles.comment} data-comment-type={comment.sentiment}>
                                        <div className={styles.info}>
                                            <div>
                                                <b>{comment.author || comment.authorId}</b>
                                                <span>Commented {new Date(comment.creationDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <p>{comment.content || 'No comment message.'}</p>
                                    </div>
                                    {replies.length > 0 && (
                                        <div className={styles.replies}>
                                            {replies.map((reply) => (
                                                <div key={reply.id} className={styles.replyContainer}>
                                                    <div className={styles.reply} data-comment-type={reply.sentiment}>
                                                        <div className={styles.info}>
                                                            <div>
                                                                <b>{reply.author || reply.authorId}</b>
                                                                <span>Replied {new Date(reply.creationDate).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <p>{reply.content || 'No reply message.'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            ) : (
                <p>No discussion comments.</p>
            )}
            {createSummaryModal && (
                <Modal>
                    <h2>Add Discusion Summary</h2>
                    <form id="add User" onSubmit={handleAddDiscusion}>
                        <fieldset>
                            <label htmlFor="discusion">Enter Summary of Discussion</label>
                            <Textbox
                                autoResize
                                className={styles.textarea}
                                id="discusion"
                                required
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setSummary(event.target.value)}
                                value={summary}
                            />
                            <label htmlFor="pros">Enter Pros</label>
                            <Textbox autoResize className={styles.textarea} id="pros" required onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setPros(event.target.value)} value={pros} />
                            <label htmlFor="cons">Enter Cons</label>
                            <Textbox autoResize className={styles.textarea} id="cons" required onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setCons(event.target.value)} value={cons} />
                        </fieldset>
                        <div className={styles.comment} data-comment-type={passed ? 'positive' : 'negative'}>
                            <p>
                                Motion <b>{passed ? 'has successfully passed' : 'failed to pass'}</b> with <b>{votesInFavor}</b> votes in favor and <b>{votesAgainst}</b> votes against.
                            </p>
                        </div>
                        <br />
                        <Modal.Actions>
                            <button type="button" onClick={() => setCreateSummaryModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" id="submitUserButton" data-button-type="primary">
                                Submit & Conclude Motion
                            </button>
                        </Modal.Actions>
                    </form>
                </Modal>
            )}
        </section>
    );
};

export { MotionArchive };
