import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LuSun, LuMoon } from 'react-icons/lu';
import ScrollToTop from '../scroll-to-top';
import AppLogo from '../../components/logo';
import { toggleTheme } from '../../store/slice/app-theme';
import { selectIsAuthenticated } from '../../store/slice/auth';
import { THEMES } from '../../theme';
import { ROUTES } from '../../utilities/app-routes';
import heroImage from '../../assets/images/home/hero-bridge.jpg';
import { AuthWrapper } from './index.style';

const PILLARS = ['Engineering', 'Tenders', 'Store', 'SiteForce'];

// Shell for register / login / forgot / reset password (frontend-plan
// §A.2–A.4): brand photo on the left (desktop), the form on the right.
// Someone already signed in is sent home — except on the reset-password and
// verify-email links, which they may legitimately open from an email.
function AuthLayout() {
	const dispatch = useDispatch();
	const location = useLocation();
	const { theme } = useSelector((state) => state.themes);
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const isDark = THEMES[theme].mode === 'dark';

	// reset / verify links come from emails — a signed-in user may open them
	const fromEmailLink = /^\/(reset-password|verify-email)/.test(
		location.pathname
	);
	if (isAuthenticated && !fromEmailLink) {
		return <Navigate to={location.state?.from || ROUTES.HOME} replace />;
	}

	return (
		<AuthWrapper>
			<ScrollToTop />

			<aside className="sc_brand" aria-hidden="true">
				<img src={heroImage} alt="" />
				<div className="sc_brandContent">
					<div>
						<p className="sc_quote">
							One account for every part of the <span>build.</span>
						</p>
						<div className="sc_pillars">
							{PILLARS.map((pillar) => (
								<span key={pillar} className="sc_pillar">
									{pillar}
								</span>
							))}
						</div>
					</div>
				</div>
			</aside>

			<main className="sc_main">
				<div className="sc_topbar">
					<Link to={ROUTES.HOME} aria-label="PolyGrid home">
						<AppLogo size={30} />
					</Link>
					<button
						type="button"
						className="sc_iconBtn"
						onClick={() => dispatch(toggleTheme())}
						aria-label={
							isDark ? 'Switch to light theme' : 'Switch to dark theme'
						}
					>
						{isDark ? <LuSun /> : <LuMoon />}
					</button>
				</div>

				<div className="sc_form">
					<Outlet />
				</div>
			</main>
		</AuthWrapper>
	);
}

export default AuthLayout;
