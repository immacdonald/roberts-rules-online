import {FC} from 'react';
import style from "./login.module.scss";

const Login: FC = () => {
    return (
        <main>
            <h1>Login</h1>
            <p>This is the login page.</p>

            <div className={style.formGroup}>
                <h2 className={style.title}>Login</h2>
                <form id="loginForm">
                    <p>Username: <label htmlFor="username"></label><input type="text" name="username" id="username"
                                                                          required/></p>
                    <p>Password: <label htmlFor="password"></label><input type="password" name="password" id="password"
                                                                          required/></p>
                    <button type="submit" id={style.loginButton} className="btn">Login</button>
                </form>
                <a href="src/404.html" id="forgotPassword">Forgot Password?</a>
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
        </main>
    );
};

export {Login};
