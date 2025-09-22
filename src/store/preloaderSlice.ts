import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PreloaderState {
    preloader: boolean;
}

const initialState: PreloaderState = {
    preloader: true,
};

const preloaderSlice = createSlice({
    name: 'preloader',
    initialState,
    reducers: {
        routeChange(state, action: PayloadAction<'start' | 'end'>) {
            state.preloader = action.payload === 'start';
        },
        setPreloader(state, action: PayloadAction<boolean>) {
            state.preloader = action.payload;
            localStorage.setItem('preloader', String(action.payload));
        },
    },
});

export const { routeChange, setPreloader } = preloaderSlice.actions;
export default preloaderSlice.reducer;
