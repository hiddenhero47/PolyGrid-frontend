import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { LuMenu, LuSun, LuMoon } from 'react-icons/lu';
import { toggleTheme } from '../../../store/slice/app-theme';
import { THEMES } from '../../../theme';
import AccountMenu from '../../../components/account-menu';
import NotificationBell from '../../../components/notification-bell';
import { TopBar as Bar, IconButton } from '../index.style';

// HM's dashboard nav bar: menu toggle (drawer, below desktop), where you
// are (each page has its own heading), theme toggle, then the account menu
// (who's signed in, their role, Dashboard / Settings / Log out).
function TopBar({ eyebrow, title, roleLabel, onOpenMenu }) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state) => state.themes);
	const isDark = THEMES[theme].mode === 'dark';

	return (
		<Bar>
			<span className="lg:hidden">
				<IconButton type="button" onClick={onOpenMenu} aria-label="Open menu">
					<LuMenu />
				</IconButton>
			</span>

			<div className="sc_title">
				<span className="sc_eyebrow">{eyebrow}</span>
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

			<NotificationBell />

			<div className="border-l border-(--pg-border-default) pl-2">
				<AccountMenu compactLabel={roleLabel} />
			</div>
		</Bar>
	);
}

TopBar.propTypes = {
	eyebrow: PropTypes.string,
	roleLabel: PropTypes.string,
	title: PropTypes.string,
	onOpenMenu: PropTypes.func,
};

export default TopBar;
