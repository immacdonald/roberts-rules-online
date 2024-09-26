import { FC, useState } from 'react';
import { Page } from '../components';
import style from './login.module.scss';

const Login: FC = (props) => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleLogIn = ():void => {
		event.preventDefault();
		console.log("Logging in...", email, password);
		// Get the values from the form
		props.socketExec("login", email, password)
	};

    return (
        <Page>
            <div className={style.loginContainer}>
                <div className={style.formGroup}>
                    <h2 className={style.title}>Login</h2>
                    <form id="loginForm" onSubmit={handleLogIn}>
                        <div className={style.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input
								type="email"
								name="email"
								id="email"
								required={true}
								onChange={(ev) => setEmail(ev.target.value)}
								value={email}
							/>
                        </div>
						<div className={style.inputGroup}>
							<label htmlFor="password">Password</label>
							<input
								type="password"
								id="password"
								required={true}
								onChange={(ev) => setPassword(ev.target.value)}
								value={password}
							/>
						</div>
						<button type="submit" id="login-button" className={style.loginButton}>
							Sign In
						</button>
					</form>
                    <a href="./NotFound.tsx" id="forgotPassword">
                        Forgot Password?
                    </a>
                </div>
                {/*<script>
                const form = document.getElementById('loginForm');
                form.addEventListener('submit', function (event) {
                event.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                console.log('Username:', username);
                console.log('Password:', password);
            });
            </script>*/}
            </div>
        </Page>
    );
};

export { Login };
