import { User } from 'server/interfaces/user';

const login = async (email?: string, password?: string, token?: string): Promise<User | null> => {
    const url = 'http://localhost:3000/api/v1/login';

    const options: RequestInit = {
        method: 'POST',
        body: JSON.stringify(email && password ? { email, password } : { token }),
        headers: { 'Content-Type': 'application/json' }
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`${response.status}`);
        }

        const data = await response.json();
        localStorage.setItem('token', data.data.token);

        return data.data.user;
    } catch (error) {
        console.warn(error);
        return null;
    }
};

const signup = async (username: string, email: string, password: string, displayname: string): Promise<User | null> => {
    const url = 'http://localhost:3000/api/v1/signup';

    const options: RequestInit = {
        method: 'POST',
        body: JSON.stringify({ username, email, password, displayname }),
        headers: { 'Content-Type': 'application/json' }
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`${response.status}`);
        }

        const data = await response.json();
        localStorage.setItem('token', data.data.token);

        return data.data.user;
    } catch (error) {
        console.warn(error);
        return null;
    }
};

export { login, signup };
