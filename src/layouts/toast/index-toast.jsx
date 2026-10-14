import React from 'react';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import { THEMES } from '../../theme';

function AppToast() {
	const { theme } = useSelector((state) => state.themes);
	return (
		<ToastContainer
			position="top-right"
			theme={THEMES[theme].mode}
			hideProgressBar
			newestOnTop
		/>
	);
}

export default AppToast;
