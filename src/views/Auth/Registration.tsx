import { FC, FormEvent, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { User } from '../../../server/interfaces/user';
import { signup } from '../../auth';
import { Page } from '../../components';
import { selectIsLoggedIn, setUser } from '../../features/userSlice';
import styles from './Auth.module.scss';

const Registration: FC = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(selectIsLoggedIn);

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    if (isLoggedIn) {
        return <Navigate to="/" />;
    }

    const handleRegister = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        signup(username, email, password, username).then((user: User | null) => {
            if (user) {
                dispatch(setUser(user));
            }
        });
    };

    return (
        <HelmetProvider>
            <Helmet>
                <title>Register - Robert's Rules</title>
            </Helmet>
            <Page>
                <section className={styles.background}>
                    <div className={styles.formGroup}>
                        <h2 className={styles.title}>Register</h2>
                        <form id="registrationForm" className={styles.form} onSubmit={handleRegister}>
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
                            <button type="submit" id="register-button" className={styles.loginButton} data-button-type="primary">
                                Register
                            </button>
                        </form>
                        <Link to="/login">Already have an account? Log in</Link>
                    </div>
                </section>
            </Page>
        </HelmetProvider>
    );
};

export { Registration };
