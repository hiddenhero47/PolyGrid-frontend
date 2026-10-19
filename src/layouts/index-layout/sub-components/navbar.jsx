import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LuMenu, LuX, LuSun, LuMoon, LuArrowRight } from 'react-icons/lu';
import AppLogo from '../../../components/logo';
import { AppButton } from '../../../components/button';
import { toggleTheme } from '../../../store/slice/app-theme';
import { THEMES } from '../../../theme';
import { ROUTES } from '../../../utilities/app-routes';
import { NavWrapper, MobileMenu } from './navbar.style';

const PILLAR_LINKS = [
	{ label: 'Engineering', to: ROUTES.ENGINEERING },
	{ label: 'Tenders', to: ROUTES.TENDERS },
	{ label: 'Store', to: ROUTES.STORE },
	{ label: 'SiteForce', to: ROUTES.SITEFORCE },
];

function Navbar({ ready = true }) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state) => state.themes);
	const [menuOpen, setMenuOpen] = useState(false);

	const isDark = THEMES[theme].mode === 'dark';
	const closeMenu = () => setMenuOpen(false);

	return (
		<NavWrapper $ready={ready}>
			<nav className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-6 px-4 md:px-8 xl:px-12">
				<Link to={ROUTES.HOME} aria-label="PolyGrid home" onClick={closeMenu}>
					<AppLogo size={34} textSize="text-[22px]" />
				</Link>

				<ul className="hidden items-center gap-9 lg:flex">
					{PILLAR_LINKS.map(({ label, to }) => (
						<li key={to}>
							<NavLink to={to} className="sc_link">
								{label}
							</NavLink>
						</li>
					))}
				</ul>

				<div className="flex items-center gap-2 sm:gap-3">
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

					<Link to={ROUTES.LOGIN} className="sc_link hidden sm:inline">
						Sign in
					</Link>

					{/* Tailwind show/hide goes on a wrapper: a styled-components
					    class that sets `display` would override it. */}
					<span className="hidden sm:inline-flex">
						<AppButton to={ROUTES.REGISTER} size="sm" icon={<LuArrowRight />}>
							Join PolyGrid
						</AppButton>
					</span>

					<span className="inline-flex lg:hidden">
						<button
							type="button"
							className="sc_iconBtn"
							onClick={() => setMenuOpen((open) => !open)}
							aria-label={menuOpen ? 'Close menu' : 'Open menu'}
							aria-expanded={menuOpen}
							aria-controls="mobile-menu"
						>
							{menuOpen ? <LuX /> : <LuMenu />}
						</button>
					</span>
				</div>
			</nav>

			<div className="lg:hidden">
				<MobileMenu id="mobile-menu" $open={menuOpen}>
					<div className="sc_inner">
						<div className="px-4 pt-2 pb-6 md:px-8">
							{PILLAR_LINKS.map(({ label, to }) => (
								<NavLink
									key={to}
									to={to}
									className="sc_link"
									onClick={closeMenu}
								>
									{label}
									<LuArrowRight className="text-lg" aria-hidden="true" />
								</NavLink>
							))}
							<div className="mt-6 flex flex-col gap-3 sm:hidden">
								<AppButton to={ROUTES.REGISTER} onClick={closeMenu}>
									Join PolyGrid
								</AppButton>
								<AppButton
									to={ROUTES.LOGIN}
									variant="secondary"
									onClick={closeMenu}
								>
									Sign in
								</AppButton>
							</div>
						</div>
					</div>
				</MobileMenu>
			</div>
		</NavWrapper>
	);
}

Navbar.propTypes = {
	ready: PropTypes.bool,
};

export default Navbar;
