import React, { useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LuShieldOff } from 'react-icons/lu';
import { selectIsAuthenticated } from '../../store/slice/auth';
import AdminServices from '../../features/services/custom-hooks/admin';
import Modal from '../../components/modal/index_modal';
import EmptyState from '../../components/empty-state';
import { AppButton } from '../../components/button';
import ScrollToTop from '../scroll-to-top';
import { REVIEW_ROLES, VERIFICATION_STATUS } from '../../utilities/app-const';
import { ROUTES } from '../../utilities/app-routes';
import { titleForPath } from './admin-nav';
import SidebarNav from './sub-components/sidebar-nav';
import TopBar from './sub-components/top-bar';
import { AdminShell, SideCard, MainColumn, PageCard } from './index.style';

const COLLAPSE_KEY = 'adminMenuCollapsed';

const readCollapsed = () => {
	try {
		return localStorage.getItem(COLLAPSE_KEY) === 'true';
	} catch {
		return false;
	}
};

// Admin Dashboard shell (frontend-plan §C) — HM's floating panels: a side
// menu card (collapsible on desktop, a drawer below 1024px), a top bar
// card and the page card. Only REVIEW_ROLES get in; the backend checks
// every request again, this just keeps everyone else out of the UI.
function AdminLayout() {
	const location = useLocation();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const { user } = useSelector((state) => state.auth);
	const drawerRef = useRef(null);
	const [collapsed, setCollapsed] = useState(readCollapsed);

	const allowed = isAuthenticated && REVIEW_ROLES.includes(user?.systemRole);

	// shares its cache with the Verifications page's pending tab count
	const { data: pending } = AdminServices.getVerifications(
		{ status: VERIFICATION_STATUS.PENDING, page: 1, limit: 1 },
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

	const toggleCollapsed = () => {
		const next = !collapsed;
		setCollapsed(next);
		try {
			localStorage.setItem(COLLAPSE_KEY, String(next));
		} catch {
			// storage blocked — it just won't be remembered
		}
	};

	const counts = { pendingVerifications: pending?.pagination?.total || 0 };

	return (
		<AdminShell>
			<ScrollToTop />
			<SideCard $collapsed={collapsed}>
				<SidebarNav
					role={user.systemRole}
					counts={counts}
					collapsed={collapsed}
					onToggleCollapse={toggleCollapsed}
				/>
			</SideCard>

			<MainColumn>
				<TopBar
					title={titleForPath(location.pathname)}
					onOpenMenu={() => drawerRef.current.open()}
				/>
				<PageCard>
					<Outlet />
				</PageCard>
			</MainColumn>

			{/* phones / tablets */}
			<Modal.Left
				refName={drawerRef}
				width="300px"
				queryWidth="86vw"
				ariaLabel="Admin menu"
			>
				<div className="flex h-full flex-col overflow-hidden rounded-r-[18px] border-r border-(--pg-sidebar-border) bg-(--pg-sidebar-background)">
					<SidebarNav
						role={user.systemRole}
						counts={counts}
						onNavigate={() => drawerRef.current.close()}
					/>
				</div>
			</Modal.Left>
		</AdminShell>
	);
}

export default AdminLayout;
