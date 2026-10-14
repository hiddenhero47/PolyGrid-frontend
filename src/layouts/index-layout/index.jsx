import React from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../scroll-to-top';
import { LayoutWrapper } from './index.style';

// Public / Basic View shell (frontend-plan §A) — header, nav and footer
// go here once designed.
function IndexLayout() {
	return (
		<LayoutWrapper>
			<ScrollToTop />
			<Outlet />
		</LayoutWrapper>
	);
}

export default IndexLayout;
