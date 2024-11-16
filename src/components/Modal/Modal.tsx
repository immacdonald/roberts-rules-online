import { FC, ReactNode } from 'react';
import styles from './Modal.module.scss';

interface ModalProps {
    children: ReactNode;
}

const ModalRoot: FC<ModalProps> = ({ children }) => {
    return (
        <div className={styles.modal}>
            <div>{children}</div>
        </div>
    );
};

interface ModalActionsProps {
    children: ReactNode;
}

const ModalActions: FC<ModalActionsProps> = ({ children }) => {
    return <div className={styles.actions}>{children}</div>;
};

export const Modal = ModalRoot as typeof ModalRoot & {
    Actions: typeof ModalActions;
};

Modal.Actions = ModalActions;
