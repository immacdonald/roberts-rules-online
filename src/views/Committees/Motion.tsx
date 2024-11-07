import { FC, useState } from 'react';
import styles from './Motion.module.scss';

interface MiniMotionReply {
    id: number;
    parentId?: number;
    backgroundClass: string;
    depth: number;
}

const Motion: FC = () => {
    const username = 'Username';
    const date = new Date().toLocaleDateString();
    const [replies, setReplies] = useState<MiniMotionReply[]>([]);
    const [repliesMain, setRepliesMain] = useState<MiniMotionReply[]>([]);

    const addReply = (parentId: number, backgroundClass: string, depth: number) => {
        setReplies([...replies, { id: replies.length, parentId, backgroundClass, depth }]);
    };

    const addReplyMain = (backgroundClass: string) => {
        setRepliesMain([...repliesMain, { id: repliesMain.length, backgroundClass, depth: 0 }]);
    };

    return (
        <section>
            <div className={styles.motionContainer}>
                <div>
                    <div className={styles.userInfo}>
                        <span>{username}</span>
                        <span>{date}</span>
                    </div>
                    <div className={styles.background}>
                        <h1>Motion title</h1>
                        <p>Motion suggestion</p>
                        <button className={styles.callVote}>Call a vote 🗳️</button>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button onClick={() => addReplyMain(styles.positive)} data-button-style='primary' className={styles.positive}>
                            Reply 👍
                        </button>
                        <button onClick={() => addReplyMain(styles.negative)} data-button-style='primary' className={styles.negative}>
                            Reply 👎
                        </button>
                        <button onClick={() => addReplyMain(styles.neutral)} data-button-style='primary' className={styles.neutral}>
                            Reply 🤷‍♀️
                        </button>
                        <button data-button-style='secondary'>Postpone 📅</button>
                        <button data-button-style='secondary'>Amend 🖋️</button>
                    </div>
                </div>
            </div>
            {/*<div className={styles.miniMotion}>*/}
            {/*    <section className={styles.backgroundGreen}>*/}
            {/*        <div className={styles.userInfo}>*/}
            {/*            <span>{username}</span>*/}
            {/*            <span>{date}</span>*/}
            {/*        </div>*/}
            {/*        <p>Mini motion message</p>*/}
            {/*    </section>*/}
            {/*    <div className={styles.buttonContainer}>*/}
            {/*        <button onClick={() => addReply(styles.backgroundGreen)} className={styles.upvote}>*/}
            {/*            Reply 👍*/}
            {/*        </button>*/}
            {/*        <button onClick={() => addReply(styles.backgroundRed)} className={styles.downvote}>*/}
            {/*            Reply 👎*/}
            {/*        </button>*/}
            {/*        <button onClick={() => addReply(styles.background)} className={styles.noVote}>*/}
            {/*            Reply 🤷‍♀️*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/*<div className={styles.miniMotion}>*/}
            {/*    <section className={styles.backgroundRed}>*/}
            {/*        <div className={styles.userInfo}>*/}
            {/*            <span>{username}</span>*/}
            {/*            <span>{date}</span>*/}
            {/*        </div>*/}
            {/*        <p>Mini motion message</p>*/}
            {/*    </section>*/}
            {/*    <div className={styles.buttonContainer}>*/}
            {/*        <button onClick={() => addReply(styles.backgroundGreen)} className={styles.upvote}>*/}
            {/*            Reply 👍*/}
            {/*        </button>*/}
            {/*        <button onClick={() => addReply(styles.backgroundRed)} className={styles.downvote}>*/}
            {/*            Reply 👎*/}
            {/*        </button>*/}
            {/*        <button onClick={() => addReply(styles.background)} className={styles.noVote}>*/}
            {/*            Reply 🤷‍♀️*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/*<div className={styles.miniMotion}>*/}
            {/*    <section className={styles.background}>*/}
            {/*        <div className={styles.userInfo}>*/}
            {/*            <span>{username}</span>*/}
            {/*            <span>{date}</span>*/}
            {/*        </div>*/}
            {/*        <p>Mini motion message</p>*/}
            {/*    </section>*/}
            {/*    <div className={styles.buttonContainer}>*/}
            {/*        <button onClick={() => addReply(styles.backgroundGreen)} className={styles.upvote}>*/}
            {/*            Reply 👍*/}
            {/*        </button>*/}
            {/*        <button onClick={() => addReply(styles.backgroundRed)} className={styles.downvote}>*/}
            {/*            Reply 👎*/}
            {/*        </button>*/}
            {/*        <button onClick={() => addReply(styles.background)} className={styles.noVote}>*/}
            {/*            Reply 🤷‍♀️*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</div>*/}
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
                        <button onClick={() => addReply(reply.id, styles.positive, reply.depth + 1)}
                            data-button-style='primary' className={styles.positive}>
                            Reply 👍
                        </button>
                        <button onClick={() => addReply(reply.id, styles.negative, reply.depth + 1)}
                            data-button-style='primary' className={styles.negative}>
                            Reply 👎
                        </button>
                        <button onClick={() => addReply(reply.id, styles.neutral, reply.depth + 1)}
                            data-button-style='primary' className={styles.neutral}>
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
                                <button onClick={() => addReply(subReply.id, styles.positive, subReply.depth + 1)}
                                    data-button-style='primary' className={styles.positive}>
                                    Reply 👍
                                </button>
                                <button onClick={() => addReply(subReply.id, styles.negative, subReply.depth + 1)}
                                    data-button-style='primary' className={styles.negative}>
                                    Reply 👎
                                </button>
                                <button onClick={() => addReply(subReply.id, styles.neutral, subReply.depth + 1)}
                                    data-button-style='primary' className={styles.neutral}>
                                    Reply 🤷‍♀️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </section>
    );
};

export { Motion };
