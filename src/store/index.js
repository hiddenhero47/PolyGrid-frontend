import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
	FLUSH,
	PAUSE,
	PERSIST,
	persistReducer,
	persistStore,
	PURGE,
	REGISTER,
	REHYDRATE,
} from 'redux-persist';
// The ES build (`es/`), not HM's `lib/` — Vite 8 hands back the CommonJS
// module object for a `lib/` default export, so it isn't callable.
import createWebStorage from 'redux-persist/es/storage/createWebStorage';
import auth from './slice/auth';
import themes from './slice/app-theme';
import { setupListeners } from '@reduxjs/toolkit/query/react';

// Combine all reducers
const appReducer = combineReducers({
	auth,
	themes,
});

// Create a no-op storage for environments without `window` (e.g., server-side rendering)
const createNoopStorage = () => ({
	getItem() {
		return Promise.resolve(null);
	},
	setItem(_, value) {
		return Promise.resolve(value);
	},
	removeItem() {
		return Promise.resolve();
	},
});

// Select appropriate storage for Redux Persist
const storage =
	typeof window !== 'undefined'
		? createWebStorage('local')
		: createNoopStorage();

// Persist configuration
const persistConfig = {
	key: 'root',
	version: 1,
	storage,
	// Specify state slices to exclude from persistence. themes persists
	// itself under its own localStorage key — see store/slice/app-theme.js.
	blacklist: ['themes'],
};

// Root reducer with logout handling
const rootReducer = (state, action) => {
	if (action.type === 'auth/logout') {
		storage.removeItem('persist:root');
		// Keep the theme — logging out shouldn't flip the UI's colors.
		// localStorage.clear();
		return appReducer({ themes: state?.themes }, action);
	}
	return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
	devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

// Optional: Setup Redux Toolkit query listeners
setupListeners(store.dispatch);
