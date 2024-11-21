import { FC, FormEvent, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { User } from 'server/interfaces/user';
import { login } from '../../auth';
import { Page } from '../../components';
import { selectUser, setUser } from '../../features/userSlice';
import styles from './Auth.module.scss';

const Login: FC = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(selectUser);

    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password');

    if (isLoggedIn) {
        return <Navigate to="/" />;
    }

    const handleLogIn = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        login(email, password).then((user: User | null) => {
            if (user) {
                dispatch(setUser(user));
            }
        });
    };

    return (
        <HelmetProvider>
            <Helmet>
                <title>Login - Robert's Rules</title>
            </Helmet>
            <Page>
                <section className={styles.background}>
                    <div className={styles.formGroup}>
                        <h2 className={styles.title}>Login</h2>
                        <form id="loginForm" className={styles.form} onSubmit={handleLogIn}>
                            <fieldset>
                                <label htmlFor="email">Email</label>
                                <input type="email" name="email" id="email" required={true} onChange={(ev) => setEmail(ev.target.value)} value={email} />
                            </fieldset>
                            <fieldset>
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" required={true} onChange={(ev) => setPassword(ev.target.value)} value={password} />
                            </fieldset>
                            <button type="submit" id="login-button" className={styles.loginButton} data-button-type="primary">
                                Log In
                            </button>
                        </form>
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                </section>
            </Page>
        </HelmetProvider>
    );
};

export { Login };
