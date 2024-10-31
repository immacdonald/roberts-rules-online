import { FC, useState } from 'react';
import Toggle from 'react-toggle';
import styles from './Committees.module.scss';

const ControlPanel: FC = () => {
    const [specialMotionAllowed, setSpecialMotionAllowed] = useState<boolean>(false);
    const [procedureMotionAllowed, setProcedureMotionAllowed] = useState<boolean>(false);

    const handleSpecialMotionChange = () => {
        setSpecialMotionAllowed(!specialMotionAllowed);
    };

    const handleProcedureMotionChange = () => {
        setProcedureMotionAllowed(!procedureMotionAllowed);
    };

    return (
        <section>
            <div className={styles.toggleSection}>
                <div className={styles.toggleText}>Allow any user to create a special motion</div>
                <div className={styles.toggle}>
                    <label htmlFor="specialMotionToggle">
                        <Toggle id="specialMotionToggle" defaultChecked={specialMotionAllowed} icons={false} onChange={handleSpecialMotionChange} />
                    </label>
                </div>
            </div>
            <div className={styles.toggleSection}>
                <div className={styles.toggleText}>Allow any user to create a procedure motion</div>
                <div className={styles.toggle}>
                    <label htmlFor="procedureMotionToggle">
                        <Toggle id="procedureMotionToggle" defaultChecked={procedureMotionAllowed} icons={false} onChange={handleProcedureMotionChange} />
                    </label>
                </div>
            </div>
        </section>
    );
};

export { ControlPanel };
