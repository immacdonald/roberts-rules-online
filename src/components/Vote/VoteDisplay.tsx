import { CSSProperties, FC } from 'react';
import styles from './VoteDisplay.module.scss';

interface VoteDisplayProps {
    yeas: number; // those in favor
    nays: number; // those against
    threshold: number; // the minimum number of votes needed to pass
    totalUsers: number; // total number of possible votes
}

const VoteDisplay: FC<VoteDisplayProps> = ({ yeas, nays, threshold, totalUsers }) => {
    const boxHeight = 200;
    const rootStyle = {
        '--box-height': `${boxHeight}px`,
        '--threshold': threshold,
        '--total-users': totalUsers,
        '--yeas': yeas,
        '--nays': nays
    } as CSSProperties;

    return (
        <div className={styles.container} style={rootStyle}>
            <p>
                Votes ({yeas + nays} / {totalUsers})
            </p>
            <div className={styles.voteBox}>
                <div className={styles.thresholdLine} data-threshold-lean={yeas > nays ? 'yea' : nays > yeas ? 'nay' : undefined}></div>

                <div className={`${styles.voteColumn} ${styles.yeaColumn}`}>{yeas > 0 && <div className={styles.voteLabel}>{yeas}</div>}</div>

                <div className={`${styles.voteColumn} ${styles.nayColumn}`}>{nays > 0 && <div className={styles.voteLabel}>{nays}</div>}</div>
            </div>
        </div>
    );
};

export { VoteDisplay };
