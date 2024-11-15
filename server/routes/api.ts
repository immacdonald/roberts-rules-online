import { Router } from 'express';
import { UserWithToken } from '../../types';
import { Users as UsersClass } from '../controllers/users';

const router = Router();

router.get('/ping', (_, res) => {
    res.send('Hello, this is the Express API.');
});

router.post('/login', async (req, res) => {
    const { email, password, token } = req.body;

    if (email && password) {
        try {
            const [isLoggedIn, response] = await UsersClass.instance.loginUser(email, password);
            if (isLoggedIn) {
                const data = response as UserWithToken;
                res.status(200).json({ success: true, data });
            } else {
                res.status(401).json({ success: false, message: response });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    } else {
        try {
            const response = await UsersClass.instance.getUserProfile(token);
            if (response) {
                res.status(200).json({ success: true, data: response });
            } else {
                res.status(401).json({ success: false, message: 'Invalid or expired token.' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
});

router.post('signup', async (req, res) => {
    const { username, email, password, displayname } = req.body;

    const [validUsername, error] = UsersClass.instance.isUsernameValid(username);
    if (!validUsername) {
        return res.status(500).json({ success: false, message: error });
    }
    if (!UsersClass.instance.isEmailValid(email)) {
        return res.status(400).json({ success: false, message: 'Email is not valid.' });
    }
    if (!UsersClass.instance.isPasswordValid(password)) {
        return res.status(400).json({ success: false, message: 'Password is not valid.' });
    }
    if (!UsersClass.instance.isDisplayNameValid(displayname)) {
        return res.status(400).json({ success: false, message: 'Display name is not valid.' });
    }

    try {
        const [userCreated, response] = await UsersClass.instance.createUser(username, email, password, displayname);
        if (userCreated) {
            const data = response as UserWithToken;
            res.status(200).json({ success: true, data });
        } else {
            res.status(401).json({ success: false, message: response });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export { router as apiRoutes };
