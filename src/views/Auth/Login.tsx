import type { SocketExec } from '../../../types';
import { FC, FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Page } from '../../components';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';
import style from './Login.module.scss';

interface LoginProps {
    socketExec: SocketExec;
}

const Login: FC<LoginProps> = ({ socketExec }) => {
    const { isLoggedIn } = useWebsiteContext();

    if (isLoggedIn) {
        return <Navigate to="/" />;
    }

    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password');

    const handleLogIn = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        console.log('Logging in...', email, password);
        // Get the values from the form
        socketExec('login', email, password);
    };

    return (
        <Page>
            <section className={style.background}>
                <div className={style.formGroup}>
                    <h2 className={style.title}>Login</h2>
                    <form id="loginForm" className={style.form} onSubmit={handleLogIn}>
                        <fieldset>
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" required={true} onChange={(ev) => setEmail(ev.target.value)} value={email} />
                        </fieldset>
                        <fieldset>
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" required={true} onChange={(ev) => setPassword(ev.target.value)} value={password} />
                        </fieldset>
                        <button type="submit" id="login-button" className={style.loginButton} data-button-type="primary">
                            Sign In
                        </button>
                    </form>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
            </section>
        </Page>
    );
};

export { Login };
