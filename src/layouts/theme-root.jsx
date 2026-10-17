import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { THEMES, themeVars } from '../theme';

function ThemeRoot({ children }) {
	const { theme } = useSelector((state) => state.themes);

	if (typeof document !== 'undefined') {
		document.body?.setAttribute('data-theme', theme);
	}

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
