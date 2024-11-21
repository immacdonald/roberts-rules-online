import { FC } from 'react';

interface VoteDisplayProps {
    yeas: number; // those in favor
    nays: number; // those against
    threshold: number; // the minimum number of votes needed to pass
    totalUsers: number; // total number of possible votes
}

const VoteDisplay: FC<VoteDisplayProps> = ({ yeas, nays, threshold, totalUsers }) => {
    const boxHeight = 200;

    const getBarColor = (): string => {
        if (yeas >= threshold) {
            return 'forestgreen';
        } else if (nays >= threshold) {
            return 'IndianRed';
        } else {
            return 'black';
        }
    };

    return (
        <>
            <p style={{ marginLeft: 63 }}>vote totals</p>
            <div
                style={{
                    width: `${boxHeight}px`,
                    height: `${boxHeight}px`,
                    backgroundColor: 'lightgray',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    position: 'relative',
                    gap: '10px'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        width: '200px',
                        height: `2px`,
                        backgroundColor: `${getBarColor()}`,
                        top: `${boxHeight - (threshold / totalUsers) * boxHeight - 2}px`
                    }}
                ></div>

                <div
                    style={{
                        width: '100px',
                        height: `${(yeas / totalUsers) * boxHeight}px`,
                        backgroundColor: 'forestgreen',
                        transition: 'height 0.3s ease',
                        marginLeft: '30px',
                        position: 'relative'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: '-20px',

                            color: `black`
                        }}
                    >
                        {yeas}
                    </div>
                </div>

                <div
                    style={{
                        width: '100px',
                        height: `${(nays / totalUsers) * boxHeight}px`,
                        backgroundColor: 'IndianRed',
                        transition: 'height 0.3s ease',
                        marginRight: '30px',
                        position: 'relative'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: '-20px',

                            color: 'black'
                        }}
                    >
                        {nays}
                    </div>
                </div>
            </div>
        </>
    );
};

export { VoteDisplay };
