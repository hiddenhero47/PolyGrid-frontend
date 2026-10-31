import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slice/auth';
import DashboardShell from '../dashboard-shell';
import VerifyEmailBanner from '../../components/verify-email-banner';
import { ACCOUNT_TYPE } from '../../utilities/app-const';
import { ROUTES } from '../../utilities/app-routes';
import { DASHBOARD_NAV } from './dashboard-nav';
import NotificationServices from '../../features/services/custom-hooks/notifications';
import MessageServices from '../../features/services/custom-hooks/messages';

// User Dashboard (frontend-plan §B) — any signed-in account. Same shell
// as the Admin Dashboard, with the workspace menu.
function DashboardLayout() {
	const location = useLocation();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const { user } = useSelector((state) => state.auth);
	const { data: unread = 0 } = NotificationServices.unreadCount({
		enabled: isAuthenticated,
	});
	const { data: unreadMessages = 0 } = MessageServices.unreadCount({
		enabled: isAuthenticated,
	});

	if (!isAuthenticated) {
		return (
			<Navigate
				to={ROUTES.LOGIN}
				state={{ from: location.pathname + location.search }}
				replace
			/>
		);
	}

	return (
		<>
			<VerifyEmailBanner />
			<DashboardShell
				sections={DASHBOARD_NAV}
				counts={{ unreadNotifications: unread, unreadMessages }}
				consoleLabel="My workspace"
				eyebrow="Workspace"
				roleLabel={
					user.activeAccountType === ACCOUNT_TYPE.BUSINESS
						? 'Business account'
						: 'Personal account'
				}
				collapseKey="dashboardMenuCollapsed"
			/>
		</>
	);
}

export default DashboardLayout;
