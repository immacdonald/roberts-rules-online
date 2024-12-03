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

const allowPostponing = false;
const showActiveMotionVotesIndex = 2;

const MotionVote: FC = () => {
    const committee = useSelector(selectCurrentCommittee)!;
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
                        <div>
                            <header className={styles.title}>
                                <h1>{motion.title}</h1>
                                {motion.flag.length > 0 && <span>{capitalize(motion.flag)}</span>}
                            </header>
                            <p>{motion.description || 'No motion description provided.'}</p>
                            <br />
                            <div style={{ marginTop: 'auto' }}>
                                {hasVoted ? (
                                    <div className={styles.cancelVote}>
                                        <span>Voting ends {new Date(motion.decisionTime).toLocaleDateString()}</span>
                                        <button onClick={() => removeVote()}>Cancel Vote</button>
                                        {(user.role == 'owner' || user.role == 'chair') && (
                                            <button onClick={() => endVoting()} data-button-type="primary" data-button-context="critical">
                                                End Voting
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <span>Vote on Motion by {new Date(motion.decisionTime).toLocaleDateString()}</span>
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
                                    <div className={styles.hiddenResults}>
                                        <span>Results are hidden during the voting period.</span>
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
                                    {allowPostponing && (
                                        <button className={styles.postpone} data-button-type="secondary">
                                            Postpone Vote
                                        </button>
                                    )}
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
                                                                {reply.authorId == id && (
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
            ) : (
                <div className={styles.noDiscussion}>
                    <p>No discussion is permitted on special motions. For more information please contact the committee chair.</p>
                </div>
            )}
        </section>
    );
};

export { MotionVote };
