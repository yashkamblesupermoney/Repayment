import { configureStore } from '@reduxjs/toolkit';
import preloaderReducer from './preloaderSlice';
import themeReducer from './themeSlice'

export const store = configureStore({
    reducer: {
        preloader: preloaderReducer,
        theme: themeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
