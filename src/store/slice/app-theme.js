import { getFromLocalStorage } from '../../utilities/basic-functions';
import { createSlice } from '@reduxjs/toolkit';
import { THEMES, DEFAULT_THEME, isThemeName } from '../../theme';

// The theme is saved under its own localStorage key, outside redux-persist
// (store/index.js leaves `themes` out of its whitelist). This is the only
// place the key is used.
const THEME_STORAGE_KEY = 'appThemes';

const savedTheme = getFromLocalStorage(THEME_STORAGE_KEY);

const initialState = {
	// a saved name that's no longer registered falls back to the default
	theme: isThemeName(savedTheme) ? savedTheme : DEFAULT_THEME,
};

const applyTheme = (theme) => {
	localStorage.setItem(THEME_STORAGE_KEY, theme);

	if (typeof document !== 'undefined') {
		document.body?.setAttribute('data-theme', theme);
	}
};

const themeSlice = createSlice({
	name: 'themes',
	initialState,
	reducers: {
		// Flips between the plain light and dark themes. From a seasonal
		// theme it goes to the plain theme of the opposite mode.
		toggleTheme: (state) => {
			const newTheme = THEMES[state.theme].mode === 'dark' ? 'light' : 'dark';
			state.theme = newTheme;
			applyTheme(newTheme);
		},
		setTheme: (state, action) => {
			if (!isThemeName(action.payload)) {
				console.warn(`[theme] "${action.payload}" isn't a registered theme`);
				return;
			}
			state.theme = action.payload;
			applyTheme(action.payload);
		},
	},
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
