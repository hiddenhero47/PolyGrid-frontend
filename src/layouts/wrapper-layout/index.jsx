import React from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../scroll-to-top';
import { LayoutWrapper } from './index.style';

// Bare full-screen shell — auth pages (register/login/reset) and 404.
function WrapperLayout() {
	return (
		<LayoutWrapper>
			<ScrollToTop />
			<Outlet />
		</LayoutWrapper>
	);
}

export default WrapperLayout;
