import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { book, spiralLines, websitePreview } from '../../assets/images';
import { Page } from '../../components';
import styles from './Home.module.scss';

const Home: FC = () => {
    return (
        <Page>
            <Helmet>
                <title>Home - Robert's Rules</title>
            </Helmet>
            <section className={styles.header}>
                <div className={styles.headline}>
                    <h1 className={styles.title}>Organized and efficient meetings, every time.</h1>
                    <h3 className={styles.subtitle}>
                        <span className={styles.highlight}>Robert's Rules Online</span> gives you the tools to manage, record, and streamline meetings so that no time is wasted.
                    </h3>
                </div>
                <div className={styles.book} style={{ backgroundImage: `url(${book})` }} />
            </section>
            <section>
                <div className={styles.welcome}>
                    <h2 className={styles.title}>
                        Welcome to <span className={styles.highlight}>Robert's Rules Online</span>
                    </h2>
                    <p>
                        Streamline your meetings and enhance collaboration with <span className={styles.highlight}>Robert's Rules Online</span>, the comprehensive digital platform designed to make
                        parliamentary procedure accessible and efficient. Whether you're a seasoned chairperson or new to the world of organized meetings, our user-friendly interface provides the
                        tools you need to navigate Robert's Rules of Order with ease.
                    </p>
                    <img style={{ maxWidth: '100%' }} src={spiralLines} alt="Lines smoothing out" />
                </div>
                <div className={styles.card}>
                    <div className={styles.content}>
                        <div className={styles.cardText}>
                            <h2>Empower Your Team</h2>
                            <p>
                                At Robert's Rules Online, we believe that effective communication and democratic decision-making are the cornerstones of any successful organization. Our platform
                                offers intuitive features that simplify the process of making motions, conducting votes, and managing discussions. Say goodbye to confusion and hello to clarity as your
                                team engages in meaningful dialogue and reaches consensus with confidence.
                            </p>
                        </div>
                        <div className={styles.cardImage}>
                            <img src={websitePreview} alt="Committee page" />
                        </div>
                    </div>
                </div>
            </section>
        </Page>
    );
};

export { Home };
