import {FC, useState} from 'react';
import {Page} from '../../components';
import styles from './Motion.module.scss';

interface MiniMotionReply {
    id: number;
    parentId: number;
    backgroundClass: string;
    depth: number;
}

const Motion: FC = () => {
    const username = 'Username';
    const date = new Date().toLocaleDateString();
    const [replies, setReplies] = useState<MiniMotionReply[]>([]);
    const [repliesMain, setRepliesMain] = useState<MiniMotionReply[]>([]);

    const addReply = (parentId: number, backgroundClass: string, depth: number) => {
        setReplies([...replies, {id: replies.length, parentId, backgroundClass, depth}]);
    };

    const addReplyMain = (backgroundClass: string) => {
        setRepliesMain([...repliesMain, {id: repliesMain.length, backgroundClass, depth: 0}]);
    };

    return (
        <>
            <div className={styles.border}>
                <div className={styles.motionContainer}>
                    <div>
                        <div className={styles.userInfo}>
                            <span>{username}</span>
                            <span>{date}</span>
                        </div>
                        <section className={styles.background}>
                            <h1>Motion title</h1>
                            <p>Motion suggestion</p>
                        </section>
                        <div className={styles.buttonContainer}>
                            <button onClick={() => addReplyMain(styles.backgroundGreen)} className={styles.upvote}>
                                Reply 👍
                            </button>
                            <button onClick={() => addReplyMain(styles.backgroundRed)} className={styles.downvote}>
                                Reply 👎
                            </button>
                            <button onClick={() => addReplyMain(styles.background)} className={styles.noVote}>
                                Reply 🤷‍♀️
                            </button>
                            <button className={styles.postpone}>Postpone 📅</button>
                            <button className={styles.amend}>Amend 🖋️</button>
                        </div>
                    </div>
                    <button className={styles.callVote}>Call a vote 🗳️</button>
                </div>
            </div>
            {repliesMain.map((reply) => (
                <div key={reply.id} className={styles.miniMotion}>
                    <section className={reply.backgroundClass}>
                        <div className={styles.userInfo}>
                            <span>{username}</span>
                            <span>{date}</span>
                        </div>
                        <p>Mini motion message</p>
                    </section>
                    <div className={styles.buttonContainer}>
                        <button onClick={() => addReply(reply.id, styles.backgroundGreen, reply.depth + 1)}
                                className={styles.upvote}>
                            Reply 👍
                        </button>
                        <button onClick={() => addReply(reply.id, styles.backgroundRed, reply.depth + 1)}
                                className={styles.downvote}>
                            Reply 👎
                        </button>
                        <button onClick={() => addReply(reply.id, styles.background, reply.depth + 1)}
                                className={styles.noVote}>
                            Reply 🤷‍♀️
                        </button>
                    </div>
                    {replies.filter(r => r.parentId === reply.id).map((subReply) => (
                        <div key={subReply.id} className={styles.miniMotionReply}>
                            <section className={subReply.backgroundClass}>
                                <div className={styles.userInfo}>
                                    <span>{username}</span>
                                    <span>{date}</span>
                                </div>
                                <p>Mini motion message</p>
                            </section>
                            <div className={styles.buttonContainer}>
                                <button
                                    onClick={() => addReply(subReply.id, styles.backgroundGreen, subReply.depth + 1)}
                                    className={styles.upvote}>
                                    Reply 👍
                                </button>
                                <button onClick={() => addReply(subReply.id, styles.backgroundRed, subReply.depth + 1)}
                                        className={styles.downvote}>
                                    Reply 👎
                                </button>
                                <button onClick={() => addReply(subReply.id, styles.background, subReply.depth + 1)}
                                        className={styles.noVote}>
                                    Reply 🤷‍♀️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </>
    );
};

export {Motion};
