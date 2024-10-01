import type { SocketExec } from '../../types';
import { FC, FormEvent, useState } from 'react';
import { Page } from '../components';
import style from './login.module.scss';

interface RegistrationProps {
    socketExec: SocketExec;
}

const Registration: FC<RegistrationProps> = ({ socketExec }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        console.log('Registering...', email, password);
        // Get the values from the form
        socketExec('register', email, password);
    };

    return (
        <Page>
            <section className={style.loginContainer}>
                <div className={style.formGroup}>
                    <h2 className={style.title}>Register</h2>
                    <form id="registrationForm" onSubmit={handleRegister}>
                        <div className={style.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" required={true} onChange={(ev) => setEmail(ev.target.value)} value={email} />
                        </div>
                        <div className={style.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" required={true} onChange={(ev) => setPassword(ev.target.value)} value={password} />
                        </div>
                        <div className={style.inputGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" required={true} onChange={(ev) => setConfirmPassword(ev.target.value)} value={confirmPassword} />
                        </div>
                        <button type="submit" id="register-button" className={style.loginButton}>
                            Register
                        </button>
                    </form>
                    <a href="/login" id="loginLink">
                        Already have an account? Log in
                    </a>
                </div>
            </section>
        </Page>
    );
};

export { Registration };
