import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { THEMES, THEME_STORAGE_KEY, themeVars } from '../theme';

// Applies the active theme once, at the top of the tree. HM set
// data-theme on <body> inside each layout's render; here it's one effect
// on <html>, which is also where index.html's pre-React script puts it.
function ThemeRoot({ children }) {
	const { theme } = useSelector((state) => state.themes);

	useLayoutEffect(() => {
		const root = document.documentElement;
		const background = THEMES[theme].tokens.surface.background;
		root.dataset.theme = theme;
		root.style.backgroundColor = background;

		// Browser chrome (mobile address bar) follows the page background.
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', background);

		// The background is saved too so index.html's script can paint it
		// before any CSS loads, without duplicating palette values there.
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme);
			localStorage.setItem(`${THEME_STORAGE_KEY}-bg`, background);
		} catch {
			// storage blocked — the theme still applies for this session
		}
	}, [theme]);

	// themeVars is CSS-variable refs, so it never changes between themes —
	// switching swaps the variables' values, not this object.
	return (
		<ThemeProvider
			theme={{ name: theme, mode: THEMES[theme].mode, ...themeVars }}
		>
			{children}
		</ThemeProvider>
	);
}

ThemeRoot.propTypes = {
	children: PropTypes.node,
};

export default ThemeRoot;
