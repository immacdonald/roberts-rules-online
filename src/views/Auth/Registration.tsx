import { FC, FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Page } from '../../components';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';
import { socket } from '../../socket';
import style from './Login.module.scss';

const Registration: FC = () => {
    const { isLoggedIn } = useWebsiteContext();

    if (isLoggedIn) {
        return <Navigate to="/" />;
    }

    const [email, setEmail] = useState('PeterGreek@gmail.com');
    const [password, setPassword] = useState('thisisapassword');
    const [confirmPassword, setConfirmPassword] = useState('thisisapassword');
    const [username, setUsername] = useState('Peter Greek');

    const handleRegister = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Get the values from the form
        console.log('Registering...', username, email, password);

        socket.emit('register', username, email, password);
    };

    return (
        <Page>
            <section className={style.background}>
                <div className={style.formGroup}>
                    <h2 className={style.title}>Register</h2>
                    <form id="registrationForm" className={style.form} onSubmit={handleRegister}>
                        <fieldset>
                            <label htmlFor="email">Username</label>
                            <input type="text" name="username" id="username" required={true} onChange={(ev) => setUsername(ev.target.value)} value={username} />
                        </fieldset>
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
