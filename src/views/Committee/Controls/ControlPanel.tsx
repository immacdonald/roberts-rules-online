import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Toggle from 'react-toggle';
import { selectCurrentCommittee } from '../../../features/committeesSlice';
import { invertFlag, isFlagged } from '../../../flags';
import { socket } from '../../../socket';
import styles from './ControlPanel.module.scss';

const defaultFlag = '0000';
const specialMotionIndex = 0;
const proceduralMotionIndex = 1;
const showActiveMotionVotesIndex = 2;
const anonymousVotingIndex = 3;

const ControlPanel: FC = () => {
    const currentCommittee = useSelector(selectCurrentCommittee)!;

    const [optimisticFlag, setOptimisticFlag] = useState<string | null>(currentCommittee.flag);

    const handleSpecialMotionChange = (): void => {
        setOptimisticFlag(invertFlag(currentCommittee.flag || defaultFlag, specialMotionIndex));
    };

    const handleProcedureMotionChange = (): void => {
        setOptimisticFlag(invertFlag(currentCommittee.flag || defaultFlag, proceduralMotionIndex));
    };

    const handleShowActiveMotionVotesChange = (): void => {
        setOptimisticFlag(invertFlag(currentCommittee.flag || defaultFlag, showActiveMotionVotesIndex));
    };

    const handleAnonymousVotingChange = (): void => {
        setOptimisticFlag(invertFlag(currentCommittee.flag || defaultFlag, anonymousVotingIndex));
    };

    useEffect(() => {
        if (optimisticFlag != currentCommittee.flag) {
            socket!.emit('updateCommitteeFlag', currentCommittee.id, optimisticFlag);
        }
    }, [optimisticFlag]);

    useEffect(() => {
        console.log(currentCommittee);
        setOptimisticFlag(currentCommittee.flag);
    }, [currentCommittee.flag]);

    return (
        <section>
            <h1>Control Panel</h1>
            <p>Settings for the committee chair to manage the state of the committee and the experience for members.</p>
            <hr />
            <fieldset className={styles.toggle}>
                <label htmlFor="specialMotionToggle">
                    <b>Special Motions</b>: Allow members to make special motions
                </label>
                <Toggle id="specialMotionToggle" defaultChecked={isFlagged(currentCommittee.flag || defaultFlag, specialMotionIndex)} icons={false} onChange={handleSpecialMotionChange} />
            </fieldset>
            <fieldset className={styles.toggle}>
                <label htmlFor="procedureMotionToggle">
                    <b>Procedural Motions</b>: Allow members to make procedural motions
                </label>
                <Toggle id="procedureMotionToggle" defaultChecked={isFlagged(currentCommittee.flag || defaultFlag, proceduralMotionIndex)} icons={false} onChange={handleProcedureMotionChange} />
            </fieldset>
            <fieldset className={styles.toggle}>
                <label htmlFor="showVotesToggle">
                    <b>Show Live Vote Totals</b>: Allow members see votes cast for active motions
                </label>
                <Toggle id="showVotesToggle" defaultChecked={isFlagged(currentCommittee.flag || defaultFlag, showActiveMotionVotesIndex)} icons={false} onChange={handleShowActiveMotionVotesChange} />
            </fieldset>
            <fieldset className={styles.toggle}>
                <label htmlFor="anonymousVotingToggle">
                    <b>Anonymous Voting</b>: Display only the voting results without member's names
                </label>
                <Toggle
                    id="anonymousVotingToggle"
                    defaultChecked={isFlagged(currentCommittee.flag || defaultFlag, anonymousVotingIndex) || true}
                    icons={false}
                    disabled
                    onChange={handleAnonymousVotingChange}
                />
            </fieldset>
        </section>
    );
};

export { ControlPanel };
