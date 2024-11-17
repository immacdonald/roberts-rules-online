// User validation checkers
const isEmailValid = (email: string): boolean => {
    if (!email) {
        return false;
    }
    if (email.length < 5) {
        return false;
    }
    if (email.length > 320) {
        return false;
    }
    // Make sure there is text then an @ then text then a . then text
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return false;
    }

    return true;
};
const isUsernameValid = (username: string): [boolean, string] => {
    if (!username) {
        return [false, 'Username must be at least 3 characters long'];
    }
    if (username.length < 3) {
        return [false, 'Username must be at least 3 characters long'];
    }
    if (username.length > 32) {
        return [false, 'Username must be at most 32 characters long'];
    }
    if (/^(?!.*[_]{2})[a-zA-Z0-9_]*[^_]$/.test(username) == false) {
        return [false, 'Username must only contain letters, numbers, underscores and periods'];
    }

    return [true, ''];
};
const isPasswordValid = (password: string): boolean => {
    if (!password) {
        return false;
    }
    if (password.length < 3) {
        return false;
    }
    if (password.length > 64) {
        return false;
    }
    // Test for only English letters and numbers and (some) special characters
    if (!/^[a-zA-Z0-9!@#$%^&*()_+-=]*$/.test(password)) {
        return false;
    }

    return true;
};
const isDisplayNameValid = (displayname: string): boolean => {
    if (!displayname) {
        return false;
    }
    if (displayname.length < 3) {
        return false;
    }
    if (displayname.length > 32) {
        return false;
    }

    return true;
};

export { isEmailValid, isUsernameValid, isPasswordValid, isDisplayNameValid };
