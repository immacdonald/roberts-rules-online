import { FC, ReactNode } from 'react';
import styles from './Modal.module.scss';

interface ModalProps {
    children: ReactNode;
}

const Modal: FC<ModalProps> = ({ children }) => {
    return (
        <div className={styles.modal}>
            <div>{children}</div>
        </div>
    );
};

export { Modal };
