import { ChangeEvent, FC, FormEvent, ReactElement, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MotionComment, Sentiment } from '../../../types';
import { DeleteIcon, EditIcon } from '../../assets/icons';
import { Textbox } from '../../components';
import { Modal } from '../../components/Modal';
import { VoteDisplay } from '../../components/Vote';
import { selectCurrentMotion } from '../../features/committeesSlice';
import { selectUser } from '../../features/userSlice';
import { socket } from '../../socket';
import styles from './Motion.module.scss';

type Reply = {
    id: string;
    sentiment: Sentiment;
    text?: string;
};

const allowEditingMotionTitles = false;

const MotionVote: FC = () => {
    const motion = useSelector(selectCurrentMotion)!;
    const user = useSelector(selectUser)!;

    const addComment = (sentiment: Sentiment, comment: string, parentComment?: string): void => {
        console.log('Commenting', comment, sentiment);
        socket!.emit('addMotionComment', motion.committeeId, motion.id, sentiment, comment, parentComment);
    };

    const removeComment = (commentId: string): void => {
        socket!.emit('removeMotionComment', motion.committeeId, motion.id, commentId);
    };

    const [editMode, setEditMode] = useState<boolean>(false);
    const [editMotionTitle, setEditMotionTitle] = useState<string>(motion.title);

    const updateMotionTitle = (): void => {
        if (editMotionTitle.length > 0) {
            socket!.emit('changeMotionTitle', motion.committeeId, motion.id, editMotionTitle);
            setEditMode(false);
        }
    };

    // Sorts from oldest to newest
    const sortedComments = useMemo(() => {
        console.log('Comments are', motion.comments);
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
                <Textbox autoResize placeholder="Response..." onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReplyingTo({ ...reply, text: event.target.value })} />
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

    const [votesInfavor, setVotesInFavor] = useState<number>(0);
    const [votesAgainst, setVotesAgainst] = useState<number>(0);
    const [threshold, setThreshold] = useState<number>(0);
    const [totalUsers, setTotalUsers] = useState<number>(0);

    const [alreadyVoted, setAlreadyVoted] = useState<boolean>(false);

    const [votingBegun, setVotingBegun] = useState(false);

    const [votingEnded, setVotingEnded] = useState(false);

    const [discusionHasBeenWritten, setDiscusionHasBeenWritten] = useState(false);
    const [createDiscusionModal, setCreateDiscusionModal] = useState(false);
    const [discusionSummary, setDiscusionSummary] = useState('');
    const [pros, setPros] = useState('');
    const [cons, setCons] = useState('');

    //const [isActiveMotion, setIsActiveMotion] = useState(true);

    const setUpVoting = (): void => {
        //TODO
        //basic setup for front end, should retrive data from database

        //set Threshold from server
        setThreshold(3);
        //set TotalUsers from server
        setTotalUsers(5);
        //set VotesInFavor from server
        setVotesInFavor(2);
        //set VotesAgainst from server
        setVotesAgainst(2);
        //check if a user has already voted and set alreadyVoted
        setAlreadyVoted(false);
        //check if voting has begun from server and set votingBegun
        setVotingBegun(false);
        //check if voting if has ended and set votingEnded
        if (votesInfavor >= threshold || votesAgainst >= threshold) setVotingEnded(true);
        //check if voting has ended and set votingEnded
        setVotingEnded(false);
        //check if discusionHasBeenWritten and set discusionHasBeenWritten
        setDiscusionHasBeenWritten(false);
        //check if its an active motion and set isActiveMotion
        //setIsActiveMotion(true);
    };

    useEffect(() => {
        //runs on page load
        setUpVoting();
    }, []);

    const userPerformsVote = (vote: boolean): void => {
        if (vote) setVotesInFavor(votesInfavor + 1);
        else setVotesAgainst(votesAgainst + 1);

        setAlreadyVoted(true);
    };

    useEffect(() => {
        //determines if enough votes have reached the threshold to end voting
        if (votesInfavor >= threshold || votesAgainst >= threshold) {
            setVotingEnded(true);
            //TODO
            //send winner of vote to database
        } else {
            setVotingEnded(false);
        }
    }, [votesInfavor, votesAgainst, threshold]);

    useEffect(() => {
        if (discusionHasBeenWritten) {
            //setIsActiveMotion(false);
            console.log('Is now a past motion');
            // TODO
            // set motion to past motion in database
        } else {
            //setIsActiveMotion(true);
        }
    }, [discusionHasBeenWritten]);

    const addDiscusionSummary = (): void => {
        setCreateDiscusionModal(true);
    };

    const handleAddDiscusion = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Adding new discusion');

        setDiscusionHasBeenWritten(true);
        setCreateDiscusionModal(false);

        // TODO
        // Add the discusion to database
    };

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
                                    {allowEditingMotionTitles && (
                                        <button data-button-type="ghost" onClick={() => setEditMode(true)} style={{ marginLeft: 'auto' }}>
                                            <EditIcon />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <input type="text" onChange={(ev) => setEditMotionTitle(ev.target.value)} value={editMotionTitle} className={styles.titleEdit} />
                                    <button data-button-type="secondary" onClick={() => setEditMode(false)}>
                                        Cancel
                                    </button>
                                    <button data-button-type="primary" onClick={() => updateMotionTitle()}>
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
                                    </>
                                ) : (
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
                                                Postpone Vote
                                            </button>
                                            <button className={styles.amend} data-button-type="secondary">
                                                Amend Motion
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {!discusionHasBeenWritten ? (
                                    <button onClick={() => addDiscusionSummary()} data-button-type="primary">
                                        Write Summary
                                    </button>
                                ) : (
                                    <div className={styles.discusionBox}>
                                        <p>Discusion Summary</p>
                                        <p className={styles.textBox}>{discusionSummary}</p>
                                        <p>Pros</p>
                                        <p className={styles.textBox}>{pros}</p>
                                        <p>Cons</p>
                                        <p className={styles.textBox}>{cons}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {replyingTo?.id == motion.id && createReplyBox(replyingTo)}
                </div>
                <div style={{ marginLeft: '10%' }}>
                    {!votingBegun ? (
                        <button style={{ marginTop: '100px' }} onClick={() => setVotingBegun(true)} data-button-type="secondary">
                            Cast Vote
                        </button>
                    ) : (
                        <VoteDisplay yeas={votesInfavor} nays={votesAgainst} threshold={threshold} totalUsers={totalUsers} />
                    )}
                </div>
            </div>
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
                                            {comment.authorId == user.id && (
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
                                {replyingTo?.id == comment.id && createReplyBox(replyingTo, comment.id)}
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
                                                        <div>
                                                            {reply.authorId == user.id && (
                                                                <button data-button-type="ghost" onClick={() => removeComment(`${reply.id}`)}>
                                                                    <DeleteIcon />
                                                                </button>
                                                            )}
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
