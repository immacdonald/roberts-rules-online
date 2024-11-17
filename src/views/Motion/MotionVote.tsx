import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MotionComment, Sentiment } from '../../../types';
import { selectCurrentMotion } from '../../features/committeesSlice';
import { selectUser } from '../../features/userSlice';
import { socket } from '../../socket';
import styles from './Motion.module.scss';

const MotionVote: FC = () => {
    const motion = useSelector(selectCurrentMotion)!;
    const user = useSelector(selectUser)!;
    const username = motion.author || motion.authorId;

    const addComment = (sentiment: Sentiment, comment: string, parentComment?: string): void => {
        socket!.emit('addMotionComment', motion.committeeId, motion.id, sentiment, comment, parentComment);
        //setComments([...comments, { id: comments.length, sentiment, content: content || '', replies: [] }]);
    };

    const removeComment = (commentId: string): void => {
        socket!.emit('removeMotionComment', motion.committeeId, motion.id, commentId);
        //setComments([...comments, { id: comments.length, sentiment, content: content || '', replies: [] }]);
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
        return [...motion.comments].sort((a, b) => a.creationDate - b.creationDate);
    }, [motion.comments]);

    return (
        <section>
            <div className={styles.motionContainer}>
                <div>
                    <div className={styles.userInfo}>
                        <span>{username}</span>
                        <span>Created {new Date(motion.creationDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.overview}>
                        <header className={styles.title}>
                            {!editMode ? (
                                <>
                                    <h1>{motion.title}</h1>
                                    <button data-button-type="ghost" onClick={() => setEditMode(true)} style={{ marginLeft: 'auto' }}>
                                        Edit
                                    </button>
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
                        <button onClick={() => addComment('positive', '')} data-button-type="primary">
                            Comment For
                        </button>
                        <button onClick={() => addComment('negative', '')} data-button-type="primary" data-button-context="critical">
                            Comment Against
                        </button>
                        <button onClick={() => addComment('neutral', '')} data-button-type="secondary">
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
                </div>
            </div>
            <div className={styles.comments}>
                {sortedComments
                    .filter((comment: MotionComment) => !comment.parentCommentId)
                    .map((comment: MotionComment) => {
                        return (
                            <div key={comment.id} className={styles.commentContainer}>
                                <div className={styles.comment} data-comment-type={comment.sentiment}>
                                    <div className={styles.userInfo}>
                                        <span>{comment.author || comment.authorId}</span>
                                        <div>
                                            {comment.authorId == user.id && (
                                                <button data-button-type="ghost" onClick={() => removeComment(`${comment.id}`)}>
                                                    Delete
                                                </button>
                                            )}
                                            <span>Posted {new Date(comment.creationDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p>{comment.content || 'No comment message.'}</p>
                                    <div className={styles.actions}>
                                        <button onClick={() => addComment('positive', '', comment.id)} data-button-type="primary">
                                            Reply For
                                        </button>
                                        <button onClick={() => addComment('negative', '', comment.id)} data-button-type="primary" data-button-context="critical">
                                            Reply Against
                                        </button>
                                        <button onClick={() => addComment('neutral', '', comment.id)} data-button-type="secondary">
                                            Neutral Reply
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.replies}>
                                    {sortedComments
                                        .filter((reply: MotionComment) => comment.id == reply.parentCommentId)
                                        .map((reply) => (
                                            <div key={reply.id} className={styles.replyContainer}>
                                                <div className={styles.reply} data-comment-type={reply.sentiment}>
                                                    <div className={styles.userInfo}>
                                                        <span>{reply.author || reply.authorId}</span>
                                                        <div>
                                                            {reply.authorId == user.id && (
                                                                <button data-button-type="ghost" onClick={() => removeComment(`${comment.id}`)}>
                                                                    Delete
                                                                </button>
                                                            )}
                                                            <span>Posted {new Date(comment.creationDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <p>{reply.content || 'No reply message.'}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </section>
    );
};

export { MotionVote };
