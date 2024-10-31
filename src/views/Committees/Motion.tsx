import { FC } from 'react';
import styles from './Motion.module.scss';

const Motion: FC = () => {
    return (
        <section>
            <h1>Motions</h1>
            <div className={styles.motion}>
                <h3>Motion about what day to bird watch</h3>
                <p>I move that Saturday become the day the group gathers to watch birds</p>
                <div className={styles.buttonContainer}>
                    <button className={styles.upvote}>Reply 👍</button>
                    <button className={styles.downvote}>Reply 👎</button>
                    <button className={styles.noVote}>Reply 🤷‍♀️</button>
                    <button className={styles.postpone}>Postpone 📅</button>
                    <button className={styles.amend}>Amend 🖋️</button>
                </div>
            </div>
        </section>
    );
};

export { Motion };
