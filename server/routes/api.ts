import { Router } from 'express';
import { UserWithToken } from '../../types';
import { createUser, loginUserWithToken, loginUser } from '../controllers/users';
import { isUsernameValid, isEmailValid, isPasswordValid, isDisplayNameValid } from '../controllers/validation';

const router = Router();

router.get('/ping', (_, res) => {
    res.send('Hello, this is the Express API.');
});

router.post('/login', async (req, res) => {
    const { email, password, token } = req.body;

    if (email && password) {
        try {
            const [isLoggedIn, response] = await loginUser(email, password);
            if (isLoggedIn) {
                const data = response as UserWithToken;
                res.status(200).json({ success: true, data });
            } else {
                res.status(401).json({ success: false, message: response });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown Error';
            res.status(500).json({ success: false, message });
        }
    } else {
        try {
            const response = await loginUserWithToken(token);
            if (response) {
                res.status(200).json({ success: true, data: response });
            } else {
                res.status(401).json({ success: false, message: 'Invalid or expired token.' });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown Error';
            res.status(500).json({ success: false, message });
        }
    }
});

router.post('/signup', async (req, res) => {
    const { username, email, password, displayname } = req.body;

    const [validUsername, error] = isUsernameValid(username);
    if (!validUsername) {
        res.status(500).json({ success: false, message: error });
    } else if (!isEmailValid(email)) {
        res.status(400).json({ success: false, message: 'Email is not valid.' });
    } else if (!isPasswordValid(password)) {
        res.status(400).json({ success: false, message: 'Password is not valid.' });
    } else if (!isDisplayNameValid(displayname)) {
        res.status(400).json({ success: false, message: 'Display name is not valid.' });
    } else {
        try {
            const [userCreated, response] = await createUser(username, email, password, displayname);
            if (userCreated) {
                const data = response as UserWithToken;
                res.status(200).json({ success: true, data });
            } else {
                res.status(401).json({ success: false, message: response });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown Error';
            res.status(500).json({ success: false, message });
        }
    }
});

export { router as apiRoutes };
