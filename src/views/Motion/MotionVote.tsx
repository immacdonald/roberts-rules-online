import { ChangeEvent, FC, ReactElement, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MotionComment, Sentiment } from '../../../types';
import { DeleteIcon, EditIcon } from '../../assets/icons';
import { Textbox } from '../../components';
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
                        </div>
                    </div>
                    {replyingTo?.id == motion.id && createReplyBox(replyingTo)}
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
        </section>
    );
};

export { MotionVote };
