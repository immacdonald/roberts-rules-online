import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CommitteeData, MotionData } from 'types';
import { socket } from '../socket';
import { RootState } from './store';

interface CommitteesState {
    committees: CommitteeData[] | null;
    currentCommitteeId: string | null;
    previousCommitteeId: string | null;
    currentMotionId: string | null;
}

const initialState: CommitteesState = {
    committees: null,
    currentCommitteeId: null,
    previousCommitteeId: null,
    currentMotionId: null
};

const committeesSlice = createSlice({
    name: 'committees',
    initialState,
    reducers: {
        setCommittees: (state, action: PayloadAction<CommitteeData[]>) => {
            state.committees = action.payload.map((committee) => ({ ...committee, motions: [] }));
        },
        setUpdatedCommittee: (state, action: PayloadAction<CommitteeData>) => {
            if (state.committees) {
                const index = state.committees.findIndex(committee => committee.id == action.payload.id);

                if (index !== -1) {
                    const updatedCommittees = [...state.committees];
                    updatedCommittees[index] = action.payload;
                    state.committees = updatedCommittees;
                } else {
                    state.committees = [...state.committees, action.payload];
                }
            }
        },
        setCurrentCommittee: (state, action: PayloadAction<string | null>) => {
            state.previousCommitteeId = state.currentCommitteeId;
            state.currentCommitteeId = action.payload;

            if (state.currentCommitteeId != state.previousCommitteeId) {
                socket!.emit('getMotions', state.currentCommitteeId);
            }
        },
        setCommitteeMotions: (state, action: PayloadAction<MotionData[]>) => {
            if (!state.committees) {
                console.warn('Cannot set committee motions before committees exist');
            } else {
                const currentCommittee = state.committees.find((committee) => committee.id === state.currentCommitteeId);
                if (currentCommittee) {
                    currentCommittee.motions = action.payload;
                }
            }
        },
        setCurrentMotion: (state, action: PayloadAction<string | null>) => {
            state.currentMotionId = action.payload;
        }
    }
});

export const { setCommittees, setUpdatedCommittee, setCurrentCommittee, setCommitteeMotions, setCurrentMotion } = committeesSlice.actions;

export const selectCommittees = (state: RootState): CommitteeData[] | null => state.committees.committees;
export const selectCurrentCommittee = (state: RootState): CommitteeData | null => state.committees.committees?.find((committee) => committee.id === state.committees.currentCommitteeId) ?? null;
export const selectCurrentMotion = (state: RootState): MotionData | null => selectCurrentCommittee(state)?.motions?.find((motion) => motion.id == state.committees.currentMotionId) ?? null;

export default committeesSlice.reducer;
