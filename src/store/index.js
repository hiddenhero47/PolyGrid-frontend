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
// The ES build (`es/`), not `lib/` — Vite 8 hands back the CommonJS
// module object for `lib/storage`'s default export, so storage.getItem
// would be undefined.
import storage from 'redux-persist/es/storage';
import auth from './slice/auth';
import themes from './slice/app-theme';

// Combine all reducers
const appReducer = combineReducers({
	auth,
	themes,
});

// Persist configuration
const persistConfig = {
	key: 'root',
	version: 1,
	storage,
	// themes persists itself under its own key (THEME_STORAGE_KEY) so
	// index.html's pre-React script can read it without parsing this blob.
	whitelist: ['auth'],
};

// Root reducer with logout handling
const rootReducer = (state, action) => {
	if (action.type === 'auth/logout') {
		storage.removeItem('persist:root');
		// Keep the theme — logging out shouldn't flip the UI's colors.
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
