import { FC, FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Page } from '../../components';
import { useWebsiteContext } from '../../contexts/useWebsiteContext';
import { socket } from '../../socket';
import style from './Login.module.scss';
import { login } from '../../auth';

const Login: FC = () => {
    const { isLoggedIn } = useWebsiteContext();

    if (isLoggedIn) {
        return <Navigate to="/" />;
    }

    const [email, setEmail] = useState('PeterGreek1@gmail.com');
    const [password, setPassword] = useState('thisisapassword');

    const handleLogIn = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        // Get the values from the form
        console.log('Logging in...', email, password);
        login(email, password);
        //socket.emit('login', email, password);
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
