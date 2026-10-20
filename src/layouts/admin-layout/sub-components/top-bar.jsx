import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LuMenu, LuSun, LuMoon, LuLogOut } from 'react-icons/lu';
import { toggleTheme } from '../../../store/slice/app-theme';
import { THEMES } from '../../../theme';
import AuthServices from '../../../features/services/custom-hooks/auth';
import ProfileAvatar from '../../../components/profile-avatar';
import { SYSTEM_ROLE_LABELS } from '../../../utilities/app-const';
import { ROUTES } from '../../../utilities/app-routes';
import { TopBar as Bar, IconButton } from '../index.style';

// HM's dashboard nav bar: menu toggle (drawer, below desktop), where you
// are (each page has its own heading), theme toggle, then who's signed in and with which role.
function TopBar({ title, onOpenMenu }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const logout = AuthServices.logout();
	const { theme } = useSelector((state) => state.themes);
	const { user } = useSelector((state) => state.auth);
	const isDark = THEMES[theme].mode === 'dark';

	const signOut = () => {
		logout();
		navigate(ROUTES.LOGIN, { replace: true });
	};

	return (
		<Bar>
			<span className="lg:hidden">
				<IconButton type="button" onClick={onOpenMenu} aria-label="Open menu">
					<LuMenu />
				</IconButton>
			</span>

			<div className="sc_title">
				<span className="sc_eyebrow">Admin console</span>
				<span className="sc_page">{title}</span>
			</div>

			<IconButton
				type="button"
				onClick={() => dispatch(toggleTheme())}
				aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
				title={isDark ? 'Light theme' : 'Dark theme'}
			>
				{isDark ? <LuSun /> : <LuMoon />}
			</IconButton>

			<div className="flex items-center gap-3 border-l border-(--pg-border-default) pl-3">
				<ProfileAvatar avatar={user?.avatar} name={user?.fullName} size={38} />
				<div className="hidden min-w-0 sm:block">
					<p className="max-w-[180px] truncate text-sm font-semibold text-(--pg-text-primary)">
						{user?.fullName}
					</p>
					<p className="font-label text-[10.5px] font-semibold tracking-[0.14em] text-(--pg-text-highlight) uppercase">
						{SYSTEM_ROLE_LABELS[user?.systemRole] || user?.systemRole}
					</p>
				</div>
			</div>

			<IconButton
				type="button"
				onClick={signOut}
				aria-label="Log out"
				title="Log out"
			>
				<LuLogOut />
			</IconButton>
		</Bar>
	);
}

TopBar.propTypes = {
	title: PropTypes.string,
	onOpenMenu: PropTypes.func,
};

export default TopBar;
