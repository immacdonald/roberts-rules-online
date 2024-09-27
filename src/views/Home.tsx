import { FC } from 'react';
import book from '../assets/images/book.png';
import lines from '../assets/images/lines.png';
import miniWebsite from '../assets/images/miniWebsite.png';
import { Page } from '../components';
import style from './Home.module.scss';

const Home: FC = () => {
    return (
        <Page>
            <section>
                <h1 className={style.title}>Robert's Rules Online</h1>
                <h2>Organized And Efficient Meetings─every time</h2>
                <p>Robert’s Rules Online gives you the tools to manage, record, and streamline meetings so that no time is wasted </p>
                <img src={book} alt="robert rule's book" />
                <h3>Welcome to Robert’s Rules Online</h3>
                <p>
                    Streamline your meetings and enhance collaboration with Robert Rules Online, the comprehensive digital platform designed to make parliamentary procedure accessible and efficient.
                    Whether you're a seasoned chairperson or new to the world of organized meetings, our user-friendly interface provides the tools you need to navigate Robert's Rules of Order with
                    ease.
                </p>

                <img src={lines} alt="lines" />

                <h3>Empower Your Team</h3>
                <p>
                    At Robert’s Rules Online, we believe that effective communication and democratic decision-making are the cornerstones of any successful organization. Our platform offers intuitive
                    features that simplify the process of making motions, conducting votes, and managing discussions. Say goodbye to confusion and hello to clarity as your team engages in meaningful
                    dialogue and reaches consensus with confidence.
                </p>

                <img src={miniWebsite} alt="mini website" />

                <h4>Pages</h4>
                <p>links to pages will go here</p>
            </section>
        </Page>
    );
};

export { Home };
