import { configureStore } from '@reduxjs/toolkit';
import committeesReducer from './committeesSlice';
import userReducer from './userSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        committees: committeesReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
