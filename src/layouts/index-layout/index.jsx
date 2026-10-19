import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ScrollToTop from '../scroll-to-top';
import Intro from '../app-intros/intro';
import Navbar from './sub-components/navbar';
import Footer from './sub-components/footer';
import { LayoutWrapper } from './index.style';

const ENTERED_KEY = 'siteEntered';

// HM's rule: play the intro once per browser session, only for a visitor
// arriving from outside (direct visit or another site), and never for
// someone who asked their OS for reduced motion.
//
// Decided once at page load, outside React — StrictMode renders twice in
// development, and the second render would otherwise see the flag the
// first one set and skip the intro.
const shouldPlayIntro = () => {
	try {
		if (sessionStorage.getItem(ENTERED_KEY)) return false;
	} catch {
		return false;
	}
	if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
		return false;
	}
	const referrer = document.referrer;
	return !referrer || !referrer.startsWith(window.location.origin);
};

const PLAY_INTRO_ON_LOAD = typeof window !== 'undefined' && shouldPlayIntro();

// Public / Basic View shell (frontend-plan §A).
function IndexLayout() {
	const location = useLocation();

	const [showIntro, setShowIntro] = useState(
		() => PLAY_INTRO_ON_LOAD && location.pathname === '/'
	);
	// Navbar waits off-screen until the intro starts lifting away.
	const [navReady, setNavReady] = useState(!showIntro);

	useEffect(() => {
		try {
			sessionStorage.setItem(ENTERED_KEY, 'true');
		} catch {
			// storage blocked — the intro may replay, nothing breaks
		}
	}, []);

	return (
		<LayoutWrapper>
			<ScrollToTop />
			{showIntro && (
				<Intro
					onstart={() => setNavReady(true)}
					onend={() => {
						// also here, in case the start event never fired
						setNavReady(true);
						setShowIntro(false);
					}}
				/>
			)}
			<Navbar ready={navReady} />
			<main className="w-full flex-1">
				<Outlet />
			</main>
			<Footer />
		</LayoutWrapper>
	);
}

export default IndexLayout;
