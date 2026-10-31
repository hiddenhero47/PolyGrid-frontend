import React, { useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuChevronDown,
	LuLayoutDashboard,
	LuShieldCheck,
	LuSettings,
	LuBriefcaseBusiness,
	LuLogOut,
} from 'react-icons/lu';
import AuthServices from '../../features/services/custom-hooks/auth';
import { toast } from '../../layouts/toast/toast-handler';
import ProfileAvatar from '../profile-avatar';
import { SUPPORTS_ANCHOR, anchorName } from '../form-components/helpers';
import { ROUTES, homeForUser } from '../../utilities/app-routes';
import { MenuTrigger, MenuPanel } from './index.style';

const EDGE = 12;

// Right-aligned placement for browsers without CSS anchor positioning,
// set in `beforetoggle` (event-driven, no effect) — same idea as the
// select's placePopover, but lined up on the trigger's right edge.
const placeRight = (trigger, panel) => {
	if (SUPPORTS_ANCHOR || !trigger || !panel) return;
	const rect = trigger.getBoundingClientRect();
	const width = panel.offsetWidth || 248;
	panel.style.left = `${Math.max(EDGE, Math.min(rect.right - width, window.innerWidth - width - EDGE))}px`;
	panel.style.top = `${rect.bottom + 8}px`;
};

// The signed-in user's menu (avatar button → Dashboard / Admin, Business
// profiles, Settings, Log out), used in the public navbar and the
// dashboards' top bar. A popover="auto" panel like CustomSelect's menu:
// the browser closes it on outside click / Escape and returns focus.
function AccountMenu({ showName = true, compactLabel }) {
	const { user } = useSelector((state) => state.auth);
	const navigate = useNavigate();
	const logout = AuthServices.logout();
	const panelId = useId();
	const anchor = anchorName('account', panelId);
	const triggerRef = useRef(null);
	const panelRef = useRef(null);
	const [open, setOpen] = useState(false);

	const home = homeForUser(user);
	const isStaff = home === ROUTES.ADMIN;
	const close = () => panelRef.current?.hidePopover();

	const signOut = () => {
		close();
		logout();
		toast.info('Signed out');
		navigate(ROUTES.HOME, { replace: true });
	};

	const items = [
		isStaff && {
			to: ROUTES.ADMIN,
			icon: LuShieldCheck,
			label: 'Admin console',
		},
		{ to: ROUTES.DASHBOARD, icon: LuLayoutDashboard, label: 'Dashboard' },
		{
			to: ROUTES.DASHBOARD_PROFILES,
			icon: LuBriefcaseBusiness,
			label: 'Business profiles',
		},
		{ to: ROUTES.DASHBOARD_SETTINGS, icon: LuSettings, label: 'Settings' },
	].filter(Boolean);

	return (
		<>
			<MenuTrigger
				ref={triggerRef}
				type="button"
				popoverTarget={panelId}
				aria-haspopup="true"
				aria-expanded={open}
				aria-label={`Account menu for ${user?.fullName || 'you'}`}
				style={{ anchorName: anchor }}
			>
				<ProfileAvatar avatar={user?.avatar} name={user?.fullName} size={36} />
				{showName && (
					<span className="hidden min-w-0 sm:block">
						<span className="block truncate text-sm font-semibold text-(--pg-text-primary)">
							{user?.fullName}
						</span>
						{compactLabel && (
							<span className="font-label block text-[10.5px] font-semibold tracking-[0.14em] text-(--pg-text-highlight) uppercase">
								{compactLabel}
							</span>
						)}
					</span>
				)}
				<LuChevronDown className="sc_chevron" aria-hidden="true" />
			</MenuTrigger>

			<MenuPanel
				ref={panelRef}
				id={panelId}
				popover="auto"
				onBeforeToggle={(e) => {
					if (e.newState === 'open')
						placeRight(triggerRef.current, panelRef.current);
				}}
				onToggle={(e) => setOpen(e.newState === 'open')}
				style={{ positionAnchor: anchor }}
			>
				<div className="sc_who">
					<span className="sc_whoName">{user?.fullName}</span>
					<span className="sc_whoEmail">{user?.email}</span>
				</div>
				<nav aria-label="Account">
					{items.map(({ to, icon: Icon, label }) => (
						<Link key={to} to={to} className="sc_item" onClick={close}>
							<Icon aria-hidden="true" /> {label}
						</Link>
					))}
					<div className="sc_divider" />
					<button
						type="button"
						className="sc_item"
						data-tone="danger"
						onClick={signOut}
					>
						<LuLogOut aria-hidden="true" /> Log out
					</button>
				</nav>
			</MenuPanel>
		</>
	);
}

AccountMenu.propTypes = {
	showName: PropTypes.bool,
	compactLabel: PropTypes.string, // small line under the name (role)
};

export default AccountMenu;
