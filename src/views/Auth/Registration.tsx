import type { SocketExec } from '../../../types';
import { FC, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../components';
import style from './Login.module.scss';

interface RegistrationProps {
    socketExec: SocketExec;
}

const Registration: FC<RegistrationProps> = ({ socketExec }) => {
    const { isLoggedIn } = useWebsiteContext();

    if (isLoggedIn) {
        return <Navigate to="/" />;
    }

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
            <section className={style.background}>
                <div className={style.formGroup}>
                    <h2 className={style.title}>Register</h2>
                    <form id="registrationForm" className={style.form} onSubmit={handleRegister}>
                        <fieldset>
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" required={true} onChange={(ev) => setEmail(ev.target.value)} value={email} />
                        </fieldset>
                        <fieldset>
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" required={true} onChange={(ev) => setPassword(ev.target.value)} value={password} />
                        </fieldset>
                        <fieldset>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" required={true} onChange={(ev) => setConfirmPassword(ev.target.value)} value={confirmPassword} />
                        </fieldset>
                        <button type="submit" id="register-button" className={style.loginButton} data-button-type="primary">
                            Register
                        </button>
                    </form>
                    <Link to="/login">Already have an account? Log in</Link>
                </div>
            </section>
        </Page>
    );
};

export { Registration };
