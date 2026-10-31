import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
	LuArrowRight,
	LuBell,
	LuDownload,
	LuGavel,
	LuHandshake,
	LuHardHat,
	LuMessagesSquare,
	LuPackage,
} from 'react-icons/lu';
import JobServices from '../../../features/services/custom-hooks/jobs';
import MessageServices from '../../../features/services/custom-hooks/messages';
import NotificationServices from '../../../features/services/custom-hooks/notifications';
import TenderServices from '../../../features/services/custom-hooks/tenders';
import SiteForceServices from '../../../features/services/custom-hooks/siteforce';
import OrderServices from '../../../features/services/custom-hooks/orders';
import PurchaseServices from '../../../features/services/custom-hooks/purchases';
import {
	StatTileLink,
	AdminSection as Section,
} from '../../../pages-admin/elements/index.style';
import { ROUTES } from '../../../utilities/app-routes';

const idOf = (v) => String(v?._id || v?.id || v || '');

function Tile({ to, label, icon: Icon, value, note, attention, loading }) {
	return (
		<StatTileLink to={to} $attention={attention}>
			<span className="sc_top">
				<span className="sc_label">{label}</span>
				<span className="sc_icon" aria-hidden="true">
					<Icon />
				</span>
			</span>
			<span className="sc_value">{loading ? '—' : value}</span>
			<span className="sc_note inline-flex items-center gap-1.5">
				{note} <LuArrowRight aria-hidden="true" />
			</span>
		</StatTileLink>
	);
}

Tile.propTypes = {
	to: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	icon: PropTypes.elementType.isRequired,
	value: PropTypes.node,
	note: PropTypes.node,
	attention: PropTypes.bool,
	loading: PropTypes.bool,
};

// What's moving across Phase 3 — jobs waiting on you, unread messages and
// notifications, open bids and applications, orders and purchases. Bids /
// applications only show for someone with a contractor / worker profile.
function Activity() {
	const { user } = useSelector((state) => state.auth);
	const toConfirm = JobServices.mine({
		status: 'pending_confirmation',
		page: 1,
		limit: 50,
	});
	const active = JobServices.mine({ status: 'active', page: 1, limit: 1 });
	const unreadMessages = MessageServices.unreadCount();
	const unreadNotes = NotificationServices.unreadCount();
	const bids = TenderServices.myBids({ page: 1, limit: 100 });
	const apps = SiteForceServices.myApplications({ page: 1, limit: 100 });
	const orders = OrderServices.mine({ page: 1, limit: 50 });
	const purchases = PurchaseServices.mine({ page: 1, limit: 100 });

	// jobs someone set up that still need *my* confirmation
	const waiting = (toConfirm.data?.data || []).filter((job) => {
		const mine =
			idOf(job.client?.userId) === String(user?.id) ? 'client' : 'provider';
		return !job[mine]?.isConfirmed;
	}).length;
	const openBids = (bids.data?.data || []).filter(
		(b) => b.status === 'pending'
	).length;
	const openApps = (apps.data?.data || []).filter(
		(a) => a.status === 'pending'
	).length;
	const ordersMoving = (orders.data?.data || []).filter((o) =>
		['pending_confirmation', 'active', 'disputed'].includes(o.job?.status)
	).length;
	const pendingPurchases = (purchases.data?.data || []).filter(
		(p) => p.status === 'pending'
	).length;

	return (
		<Section aria-labelledby="activity-heading">
			<div className="sc_sectionHead">
				<h3 id="activity-heading" className="sc_sectionTitle">
					Your activity
				</h3>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Tile
					to={`${ROUTES.DASHBOARD_JOBS}?status=pending_confirmation`}
					label="Jobs to confirm"
					icon={LuHandshake}
					value={waiting}
					note={waiting ? 'Waiting on you' : 'Nothing waiting'}
					attention={waiting > 0}
					loading={toConfirm.isPending}
				/>
				<Tile
					to={`${ROUTES.DASHBOARD_JOBS}?status=active`}
					label="Active jobs"
					icon={LuHandshake}
					value={active.data?.pagination?.total ?? 0}
					note="Stages, money, files"
					loading={active.isPending}
				/>
				<Tile
					to={ROUTES.DASHBOARD_MESSAGES}
					label="Unread messages"
					icon={LuMessagesSquare}
					value={unreadMessages.data ?? 0}
					note="Messages"
					attention={unreadMessages.data > 0}
					loading={unreadMessages.isPending}
				/>
				<Tile
					to={ROUTES.DASHBOARD_NOTIFICATIONS}
					label="Notifications"
					icon={LuBell}
					value={unreadNotes.data ?? 0}
					note="Unread"
					attention={unreadNotes.data > 0}
					loading={unreadNotes.isPending}
				/>
				{!bids.data?.noProfile && (
					<Tile
						to={`${ROUTES.DASHBOARD_TENDERS}?view=bids`}
						label="Open bids"
						icon={LuGavel}
						value={openBids}
						note="Tenders"
						loading={bids.isPending}
					/>
				)}
				{!apps.data?.noProfile && (
					<Tile
						to={`${ROUTES.DASHBOARD_SITEFORCE}?view=applications`}
						label="Open applications"
						icon={LuHardHat}
						value={openApps}
						note="SiteForce"
						loading={apps.isPending}
					/>
				)}
				<Tile
					to={ROUTES.DASHBOARD_ORDERS}
					label="Orders in progress"
					icon={LuPackage}
					value={ordersMoving}
					note="Store orders"
					loading={orders.isPending}
				/>
				<Tile
					to={ROUTES.DASHBOARD_PURCHASES}
					label="Purchases pending"
					icon={LuDownload}
					value={pendingPurchases}
					note={pendingPurchases ? 'Finish paying' : 'Digital files'}
					attention={pendingPurchases > 0}
					loading={purchases.isPending}
				/>
			</div>
		</Section>
	);
}

export default Activity;
