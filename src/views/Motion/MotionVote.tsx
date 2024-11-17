import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentMotion } from '../../features/committeesSlice';
import styles from './Motion.module.scss';
import { socket } from '../../socket';

type Sentiment = 'positive' | 'negative' | 'neutral';

type MotionComment = {
    id: number;
    sentiment: Sentiment;
    content: string;
    replies: MotionReply[];
};

type MotionReply = {
    id: number;
    sentiment: Sentiment;
    content: string;
};

const MotionVote: FC = () => {
    const motion = useSelector(selectCurrentMotion)!;
    const username = motion.authorUsername || motion.authorId;

    const [comments, setComments] = useState<MotionComment[]>([]);

    const addComment = (sentiment: Sentiment, content?: string): void => {
        setComments([...comments, { id: comments.length, sentiment, content: content || '', replies: [] }]);
    };

    const addReply = (commentId: number, sentiment: Sentiment, content?: string): void => {
        const comment = comments[commentId];
        comment.replies.push({ id: comment.replies.length, sentiment, content: content || '' });
        const updatedComments = comments;
        comments[commentId] = comment;
        setComments([...updatedComments]);
    };

    const [editMode, setEditMode] = useState<boolean>(false);
    const [editMotionTitle, setEditMotionTitle] = useState<string>(motion.title);

    const updateMotionTitle = () => {
        if (editMotionTitle.length > 0) {
            socket!.emit("changeMotionTitle", motion.committeeId, motion.id, editMotionTitle)
            setEditMode(false);
        }
    }

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
                                    <button data-button-type='ghost' onClick={() => setEditMode(true)} style={{ marginLeft: "auto" }}>Edit</button>
                                </>
                            ) : (
                                <>
                                    <input type='text' onChange={(ev) => setEditMotionTitle(ev.target.value)} value={editMotionTitle} className={styles.titleEdit} />
                                    <button data-button-type='secondary' onClick={() => setEditMode(false)}>Cancel</button>
                                    <button data-button-type='primary' onClick={() => updateMotionTitle()}>Change Title</button>
                                </>
                            )}
                        </header>
                        <p>{motion.description || 'No motion description provided.'}</p>
                        <br />
                        <p>Vote on Motion by {new Date(motion.decisionTime).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.actions}>
                        <button onClick={() => addComment('positive')} data-button-type="primary">
                            Comment For
                        </button>
                        <button onClick={() => addComment('negative')} data-button-type="primary" data-button-context="critical">
                            Comment Against
                        </button>
                        <button onClick={() => addComment('neutral')} data-button-type="secondary">
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
                {comments.map((comment: MotionComment) => {
                    return (
                        <div key={comment.id} className={styles.commentContainer}>
                            <div className={styles.comment} data-comment-type={comment.sentiment}>
                                <div className={styles.userInfo}>
                                    <span>Unknown User</span>
                                </div>
                                <p>{comment.content || 'No comment message.'}</p>
                                <div className={styles.actions}>
                                    <button onClick={() => addReply(comment.id, 'positive')} data-button-type="primary">
                                        Reply For
                                    </button>
                                    <button onClick={() => addReply(comment.id, 'negative')} data-button-type="primary" data-button-context="critical">
                                        Reply Against
                                    </button>
                                    <button onClick={() => addReply(comment.id, 'neutral')} data-button-type="secondary">
                                        Neutral Reply
                                    </button>
                                </div>
                            </div>
                            <div className={styles.replies}>
                                {comment.replies.map((reply) => (
                                    <div key={reply.id} className={styles.replyContainer}>
                                        <div className={styles.reply} data-comment-type={reply.sentiment}>
                                            <div className={styles.userInfo}>
                                                <span>Unknown User</span>
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
