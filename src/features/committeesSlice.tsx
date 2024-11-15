import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CommitteeData, MotionData } from 'types';
import { socket } from '../socket';
import { RootState } from './store';

interface CommitteesState {
    committees: CommitteeData[];
    currentCommitteeId: string | null;
    previousCommitteeId: string | null;
}

const initialState: CommitteesState = {
    committees: [],
    currentCommitteeId: null,
    previousCommitteeId: null
};

const committeesSlice = createSlice({
    name: 'committees',
    initialState,
    reducers: {
        setCommittees: (state, action: PayloadAction<CommitteeData[]>) => {
            state.committees = action.payload.map((committee) => ({ ...committee, motions: [] }));
        },
        setCurrentCommittee: (state, action: PayloadAction<string | null>) => {
            state.previousCommitteeId = state.currentCommitteeId;
            state.currentCommitteeId = action.payload;

            if (state.currentCommitteeId != state.previousCommitteeId) {
                socket!.emit('getMotions', state.currentCommitteeId);
            }
        },
        setCommitteeMotions: (state, action: PayloadAction<MotionData[]>) => {
            const currentCommittee = state.committees.find((committee) => committee.id === state.currentCommitteeId);
            if (currentCommittee) {
                currentCommittee.motions = action.payload;
            }
        }
    }
});

export const { setCommittees, setCurrentCommittee, setCommitteeMotions } = committeesSlice.actions;

export const selectCommittees = (state: RootState): CommitteeData[] => state.committees.committees;
export const selectCurrentCommittee = (state: RootState): CommitteeData | null => state.committees.committees.find((committee) => committee.id === state.committees.currentCommitteeId) ?? null;

export default committeesSlice.reducer;
