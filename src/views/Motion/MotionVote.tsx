import { ChangeEvent, FC, ReactElement, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MotionComment, Sentiment } from '../../../types';
import { capitalize } from '../../../utility';
import { DeleteIcon } from '../../assets/icons';
import { Textbox } from '../../components';
import { VoteDisplay } from '../../components/Vote';
import { selectCurrentCommittee, selectCurrentMotion } from '../../features/committeesSlice';
import { selectUser } from '../../features/userSlice';
import { isFlagged } from '../../flags';
import { socket } from '../../socket';
import styles from './Motion.module.scss';

type Reply = {
    id: string;
    sentiment: Sentiment;
    text?: string;
};

const allowEditingsubmotionTitles = false;

const MotionVote: FC = () => {
    const [createModal, setCreateModal] = useState<boolean>(false);

    const [submotionTitle, setSubmotionTitle] = useState<string>('');
    const [submotionDesc, setSubmotionDesc] = useState<string>('');

    const createSubmotion = (): void => {
        console.log('Create a new motion');
        setCreateModal(true);
    };

    const handleCreateSubmotion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Creating new submotion:', submotionTitle, submotionDesc);
        socket!.emit('createSubmotion', submotionTitle, submotionDesc);
    };

    const motion = useSelector(selectCurrentMotion)!;
    const { id } = useSelector(selectUser)!;
    const user = useMemo(() => committee.members.find((member) => member.id == id)!, [id, committee]);
    const navigate = useNavigate();

    const addComment = (sentiment: Sentiment, comment: string, parentComment?: string): void => {
        socket!.emit('addMotionComment', motion.committeeId, motion.id, sentiment, comment, parentComment);
    };

    const removeComment = (commentId: string): void => {
        socket!.emit('removeMotionComment', motion.committeeId, motion.id, commentId);
    };

    const [editMode, setEditMode] = useState<boolean>(false);
    const [editsubmotionTitle, setEditsubmotionTitle] = useState<string>(motion.title);

    const updatesubmotionTitle = (): void => {
        if (editsubmotionTitle.length > 0) {
            socket!.emit('changesubmotionTitle', motion.committeeId, motion.id, editsubmotionTitle);
            setEditMode(false);
        }
    };

    // Sorts from oldest to newest
    const sortedComments = useMemo(() => {
        if (!motion?.comments) return [];
        return [...motion.comments].sort((a, b) => b.creationDate - a.creationDate);
    }, [motion.comments]);

    const [replyingTo, setReplyingTo] = useState<Reply | null>(null);

    const createReplyBox = (reply: Reply, parentComment?: string): ReactElement => {
        return (
            <div className={styles.response}>
                <header>
                    <h4>
                        {!parentComment ? (reply.sentiment == 'positive' ? 'Comment in Favor of Motion' : reply.sentiment == 'negative' ? 'Comment Against Motion' : 'Comment on Motion') : 'Reply'}
                    </h4>
                </header>
                <Textbox autoResize invisible placeholder="Response..." onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReplyingTo({ ...reply, text: event.target.value })} />
                <div className={styles.submit}>
                    <button onClick={() => setReplyingTo(null)} data-button-type="ghost" type="button">
                        Cancel
                    </button>
                    <button
                        disabled={!(reply.sentiment && reply.text)}
                        onClick={() => {
                            addComment(reply.sentiment!, reply.text!, parentComment);
                            setReplyingTo(null);
                        }}
                        data-button-type="secondary"
                        type="button"
                    >
                        Submit
                    </button>
                </div>
            </div>
        );
    };

    const hasVoted = useMemo(() => {
        return Object.keys(motion.vote).some((userId) => userId == id);
    }, [motion]);

    const votesInFavor = useMemo(() => {
        return Object.values(motion.vote).filter((vote) => vote == 'yea').length;
    }, [motion]);

    const votesAgainst = useMemo(() => {
        return Object.values(motion.vote).filter((vote) => vote == 'nay').length;
    }, [motion]);

    const activeMotion = useMemo(() => {
        return motion.decisionTime > Date.now();
    }, [motion]);

    const userPerformsVote = (favor: boolean): void => {
        socket!.emit('addMotionVote', motion.committeeId, motion.id, favor ? 'yea' : 'nay');
    };

    const removeVote = (): void => {
        socket!.emit('removeMotionVote', motion.committeeId, motion.id);
    };

    const endVoting = (): void => {
        socket!.emit('changeMotionDecisionTime', motion.committeeId, motion.id, Date.now());
    };

    const showLiveVotes = isFlagged(committee.flag, showActiveMotionVotesIndex);

    const motionThreshold = motion.flag == 'procedural' || motion.flag == 'special' ? Math.ceil(committee.members.length * 0.66) : Math.ceil(committee.members.length * 0.5);

    useEffect(() => {
        if (!activeMotion) {
            navigate(`/committees/${committee.id}/past-motions`);
        }
    }, [activeMotion]);

    return (
        <section>
            <div className={styles.motionContainer}>
                <div>
                    <div className={styles.info}>
                        <b>{motion.author || motion.authorId}</b>
                        <span>Created {new Date(motion.creationDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.overview}>
                        <header className={styles.title}>
                            {!editMode ? (
                                <>
                                    <h1>{motion.title}</h1>
                                    {allowEditingsubmotionTitles && (
                                        <button data-button-type="ghost" onClick={() => setEditMode(true)} style={{ marginLeft: 'auto' }}>
                                            <EditIcon />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <input type="text" onChange={(ev) => setEditsubmotionTitle(ev.target.value)} value={editsubmotionTitle} className={styles.titleEdit} />
                                    <button data-button-type="secondary" onClick={() => setEditMode(false)}>
                                        Cancel
                                    </button>
                                    <button data-button-type="primary" onClick={() => updatesubmotionTitle()}>
                                        Change Title
                                    </button>
                                </>
                            )}
                        </header>
                        <p>{motion.description || 'No motion description provided.'}</p>
                        <br />
                        <p>Vote on Motion by {new Date(motion.decisionTime).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.actions}>
                        {!votingEnded ? (
                            <>
                                {votingBegun ? (
                                    // Display these buttons when voting has begun
                                    <>
                                        {!alreadyVoted ? (
                                            <>
                                                <button onClick={() => userPerformsVote(true)} data-button-type="primary">
                                                    Vote in Favor
                                                </button>
                                                <button onClick={() => userPerformsVote(false)} data-button-type="primary" data-button-context="critical">
                                                    Vote Against
                                                </button>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={() => setReplyingTo({ id: motion.id, sentiment: 'positive' })} data-button-type="primary">
                                            Comment For
                                        </button>
                                        <button onClick={() => setReplyingTo({ id: motion.id, sentiment: 'negative' })} data-button-type="primary" data-button-context="critical">
                                            Comment Against
                                        </button>
                                        <button onClick={() => setReplyingTo({ id: motion.id, sentiment: 'neutral' })} data-button-type="secondary">
                                            Neutral Comment
                                        </button>
                                        <div className={styles.modify}>
                                            <button className={styles.postpone} data-button-type="secondary">
                                                Postpone Vote
                                            </button>
                                            <button className={styles.amend} data-button-type="secondary">
                                                Amend Motion
                                            </button>
                                            <button data-button-type="primary" onClick={() => createSubmotion()}>
                                                Create New Submotion
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        {!hasVoted ? (
                            <div className={styles.voteButtons}>
                                <button onClick={() => userPerformsVote(true)} data-button-type="primary">
                                    Vote in Favor
                                </button>
                                <button onClick={() => userPerformsVote(false)} data-button-type="primary" data-button-context="critical">
                                    Vote Against
                                </button>
                            </div>
                        ) : (
                            <div>
                                {showLiveVotes ? (
                                    <VoteDisplay yeas={votesInFavor} nays={votesAgainst} threshold={motionThreshold} totalUsers={committee.members.length} />
                                ) : (
                                    <div className={styles.discusionBox}>
                                        <p>Discussion Summary</p>
                                        <p className={styles.textBox}>{discusionSummary}</p>
                                        <p>Pros</p>
                                        <p className={styles.textBox}>{pros}</p>
                                        <p>Cons</p>
                                        <p className={styles.textBox}>{cons}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className={styles.actions}>
                        {activeMotion && motion.flag != 'special' && (
                            <>
                                <div>
                                    <button onClick={() => setReplyingTo({ id: motion.id, sentiment: 'positive' })} data-button-type="primary">
                                        Comment For
                                    </button>
                                    <button onClick={() => setReplyingTo({ id: motion.id, sentiment: 'negative' })} data-button-type="primary" data-button-context="critical">
                                        Comment Against
                                    </button>
                                    <button onClick={() => setReplyingTo({ id: motion.id, sentiment: 'neutral' })} data-button-type="secondary">
                                        Neutral Comment
                                    </button>
                                </div>
                                <div className={styles.modify}>
                                    <button className={styles.postpone} data-button-type="secondary">
                                        Propose Submotion
                                    </button>
                                    <button className={styles.amend} data-button-type="secondary">
                                        Amend Motion
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    {replyingTo?.id == motion.id && createReplyBox(replyingTo)}
                </div>
            </div>
            {motion.flag != 'special' ? (
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
                                            <div>
                                                {comment.authorId == id && (
                                                    <button data-button-type="ghost" onClick={() => removeComment(`${comment.id}`)}>
                                                        <DeleteIcon />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p>{comment.content || 'No comment message.'}</p>
                                        {
                                            <div className={styles.actions}>
                                                <button onClick={() => setReplyingTo({ id: comment.id, sentiment: 'neutral' })} data-button-type="ghost">
                                                    Reply
                                                </button>
                                            </div>
                                        }
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>

            {createModal && (
                <Modal>
                    <h2>Create New Submotion</h2>
                    <form id="createSubmotion" onSubmit={handleCreateSubmotion}>
                        <fieldset>
                            <label htmlFor="committeeName">Submotion Title</label>
                            <input type="text" name="submotionTitle" id="submotionTitle" required={true} onChange={(ev) => setSubmotionTitle(ev.target.value)} value={submotionTitle} />
                        </fieldset>
                        <fieldset>
                            <label htmlFor="password">Submotion Description</label>
                            <input type="text" id="submotionDesc" required={true} onChange={(ev) => setSubmotionDesc(ev.target.value)} value={submotionDesc} />
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

            {createDiscusionModal && (
                <Modal>
                    <h2>Add Discusion Summary</h2>
                    <form id="add User" onSubmit={handleAddDiscusion}>
                        <fieldset>
                            <label htmlFor="discusion">Enter Discusion</label>
                            <textarea className={styles.textAreaStyle} id="discusion" required={true} onChange={(ev) => setDiscusionSummary(ev.target.value)} value={discusionSummary} />
                            <label htmlFor="pros">Enter Pros</label>
                            <textarea className={styles.textAreaStyle} id="pros" required={true} onChange={(ev) => setPros(ev.target.value)} value={pros} />
                            <label htmlFor="cons">Enter Cons</label>
                            <textarea className={styles.textAreaStyle} id="cons" required={true} onChange={(ev) => setCons(ev.target.value)} value={cons} />
                        </fieldset>
                        <Modal.Actions>
                            <button type="button" onClick={() => setCreateDiscusionModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" id="submitUserButton" data-button-type="primary">
                                Submit
                            </button>
                        </Modal.Actions>
                    </form>
                </Modal>
            )}
        </section>
    );
};

export { MotionVote };
