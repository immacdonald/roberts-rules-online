import {FC} from 'react';
import style from './login.module.scss';

const Login: FC = () => {
    return (
        <main>
            <div className={style.formGroup}>
                <h2 className={style.title}>Login</h2>
                <form id='loginForm'>
                    <div className={style.inputGroup}>
                        <label htmlFor='email'>Email</label>
                        <input type='text' name='email' id='email' required/>
                    </div>
                    <div className={style.inputGroup}>
                        <label htmlFor='password'>Password</label>
                        <input type='password' name='password' id='password' required/>
                    </div>
                    <button type='submit' id={style.loginButton} className='btn'>Sign In</button>
                </form>
                <a href='./NotFound.tsx' id='forgotPassword'>Forgot Password?</a>
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
