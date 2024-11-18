import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../server/interfaces/user';
import { RootState } from './store';

interface UserState {
    user: User | null;
    isLoggedIn: boolean;
}

const initialState: UserState = {
    user: null,
    isLoggedIn: false
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
            state.isLoggedIn = !!action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            localStorage.removeItem('token');
        }
    }
});

export const { setUser, logout } = userSlice.actions;

export const selectUser = (state: RootState): User | null => state.user.user;
export const selectIsLoggedIn = (state: RootState): boolean => state.user.isLoggedIn;

export default userSlice.reducer;
