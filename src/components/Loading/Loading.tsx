import { FC } from 'react';
import styles from './Loading.module.scss';

const Loading: FC = () => {
    return (
        <div className={styles.loading}>
            <div className={styles.indicator} />
        </div>
    );
};

export { Loading };
