import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LuShieldOff } from 'react-icons/lu';
import { selectIsAuthenticated } from '../../store/slice/auth';
import AdminServices from '../../features/services/custom-hooks/admin';
import EmptyState from '../../components/empty-state';
import { AppButton } from '../../components/button';
import DashboardShell from '../dashboard-shell';
import {
	REVIEW_ROLES,
	SYSTEM_ROLE_LABELS,
	VERIFICATION_STATUS,
} from '../../utilities/app-const';
import { ROUTES } from '../../utilities/app-routes';
import { navForRole } from './admin-nav';

// Admin Dashboard (frontend-plan §C). Only REVIEW_ROLES get in; the
// backend checks every request again, this just keeps everyone else out
// of the UI.
function AdminLayout() {
	const location = useLocation();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const { user } = useSelector((state) => state.auth);

	const allowed = isAuthenticated && REVIEW_ROLES.includes(user?.systemRole);

	// shares its cache with the Verifications page's pending tab count
	const { data: pending } = AdminServices.getVerifications(
		{ status: VERIFICATION_STATUS.PENDING, page: 1, limit: 1 },
		{ enabled: allowed }
	);

	const { data: pendingDigital } = AdminServices.getDigitalReview(
		{ status: 'pending', page: 1, limit: 1 },
		{ enabled: allowed }
	);

	if (!isAuthenticated) {
		return (
			<Navigate
				to={ROUTES.LOGIN}
				state={{ from: location.pathname + location.search }}
				replace
			/>
		);
	}

	if (!allowed) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-(--pg-surface-background) p-4">
				<EmptyState
					icon={<LuShieldOff />}
					eyebrow="Restricted"
					title="Staff only"
					text="This area is for PolyGrid staff. If you think you should have access, ask a super admin."
					actions={<AppButton to={ROUTES.HOME}>Back to PolyGrid</AppButton>}
				/>
			</div>
		);
	}

	return (
		<DashboardShell
			sections={navForRole(user.systemRole)}
			counts={{
				pendingVerifications: pending?.pagination?.total || 0,
				pendingDigital: pendingDigital?.pagination?.total || 0,
			}}
			consoleLabel="Command console"
			eyebrow="Admin console"
			roleLabel={SYSTEM_ROLE_LABELS[user.systemRole] || user.systemRole}
			collapseKey="adminMenuCollapsed"
		/>
	);
}

export default AdminLayout;
