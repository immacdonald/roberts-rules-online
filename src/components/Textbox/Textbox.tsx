import { ChangeEvent, FC, forwardRef, HTMLProps, useLayoutEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './Textbox.module.scss';

interface TextboxProps extends HTMLProps<HTMLTextAreaElement> {
    autoResize?: boolean;
    invisible?: boolean;
}

const Textbox: FC<TextboxProps> = forwardRef<HTMLTextAreaElement, TextboxProps>(({ autoResize, invisible, onChange = (): void => {}, className = '', ...rest }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textboxRef = ref || internalRef;

    const adjustHeight = (): void => {
        const textarea = (textboxRef as React.RefObject<HTMLTextAreaElement>).current;
        if (textarea && autoResize) {
            textarea.style.height = 'inherit';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useLayoutEffect((): void => {
        if (autoResize) {
            adjustHeight();
        }
    }, [autoResize]);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        if (autoResize) {
            adjustHeight();
        }
        onChange(event);
    };

    return <textarea ref={textboxRef} onChange={handleChange} className={clsx(styles.textbox, { [styles.invisible]: invisible }, className)} {...rest} />;
});

export { Textbox };
