import { createSlice } from '@reduxjs/toolkit';
import {
	THEMES,
	DEFAULT_THEME,
	THEME_STORAGE_KEY,
	isThemeName,
} from '../../theme';

// Saved choice → OS preference → default. The inline script in
// index.html runs this same lookup before React loads, so the first
// paint is already in the right theme (no light-to-dark flash).
const getInitialTheme = () => {
	try {
		const saved = localStorage.getItem(THEME_STORAGE_KEY);
		if (isThemeName(saved)) return saved;
	} catch {
		// storage blocked (private mode etc.) — fall through
	}
	if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}
	return DEFAULT_THEME;
};

const initialState = {
	theme: getInitialTheme(),
};

// Pure reducers only — applying the theme to <html> and saving it to
// localStorage happens in layouts/theme-root.jsx.
const themeSlice = createSlice({
	name: 'themes',
	initialState,
	reducers: {
		setTheme: (state, action) => {
			if (isThemeName(action.payload)) state.theme = action.payload;
		},
		// Flips between the plain light and dark themes. From a seasonal
		// theme it goes to the plain theme of the opposite mode.
		toggleTheme: (state) => {
			state.theme = THEMES[state.theme].mode === 'dark' ? 'light' : 'dark';
		},
	},
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
