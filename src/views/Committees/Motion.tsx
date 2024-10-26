import { FC } from 'react';
import { Page } from '../../components';
import { CommitteeNav } from '../../components/CommitteeNav';
import styles from './Motion.module.scss';

const Motion: FC = () => {
    return (
        <Page>
            <CommitteeNav />
            <section>
                <h1>Motion about what day to bird watch</h1>
                <p>I move that Saturday become the day the group gathers to watch birds</p>
                <div className={styles.buttonContainer}>
                    <button className={styles.upvote}>Reply 👍</button>
                    <button className={styles.downvote}>Reply 👎</button>
                    <button className={styles.noVote}>Reply 🤷‍♀️</button>
                    <button className={styles.postpone}>Postpone 📅</button>
                    <button className={styles.amend}>Amend 🖋️</button>
                </div>
            </section>
        </Page>
    );
};

export { Motion };
