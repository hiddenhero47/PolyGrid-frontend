import {
	LuLayoutDashboard,
	LuBadgeCheck,
	LuLayers,
	LuCreditCard,
	LuGavel,
	LuFileCheck,
	LuWallet,
	LuShieldAlert,
	LuUsers,
	LuReceipt,
	LuHandshake,
} from 'react-icons/lu';
import { ROUTES } from '../../utilities/app-routes';
import { REVIEW_ROLES, MANAGE_ROLES } from '../../utilities/app-const';

// The admin side menu, grouped like HM's MenuSections. `roles` = who sees
// the item (the backend still guards every route); `soon` = not built yet,
// shown greyed so the console's shape is visible (frontend-plan §C).
export const ADMIN_NAV = [
	{
		heading: 'Command',
		items: [
			{
				label: 'Overview',
				to: ROUTES.ADMIN,
				icon: LuLayoutDashboard,
				roles: REVIEW_ROLES,
				end: true,
			},
		],
	},
	{
		heading: 'Review queues',
		items: [
			{
				label: 'Verifications',
				to: ROUTES.ADMIN_VERIFICATIONS,
				icon: LuBadgeCheck,
				roles: REVIEW_ROLES,
				countKey: 'pendingVerifications',
			},
			{
				label: 'Digital files',
				to: ROUTES.ADMIN_DIGITAL_REVIEW,
				icon: LuFileCheck,
				roles: REVIEW_ROLES,
				countKey: 'pendingDigital',
			},
			{
				label: 'Disputes',
				to: ROUTES.ADMIN_DISPUTES,
				icon: LuGavel,
				roles: REVIEW_ROLES,
				countKey: 'openDisputes',
			},
			{
				label: 'Moderation',
				icon: LuShieldAlert,
				roles: REVIEW_ROLES,
				soon: true,
			},
		],
	},
	{
		heading: 'Billing',
		items: [
			{
				label: 'Plans',
				to: ROUTES.ADMIN_PLANS,
				icon: LuLayers,
				roles: MANAGE_ROLES,
			},
			{
				label: 'Subscriptions',
				to: ROUTES.ADMIN_SUBSCRIPTIONS,
				icon: LuCreditCard,
				roles: MANAGE_ROLES,
			},
			{
				label: 'Refunds & payouts',
				to: ROUTES.ADMIN_REFUNDS_PAYOUTS,
				icon: LuWallet,
				roles: REVIEW_ROLES,
				countKey: 'pendingMoneyRequests',
			},
			{
				label: 'Jobs',
				to: ROUTES.ADMIN_JOBS,
				icon: LuHandshake,
				roles: MANAGE_ROLES,
			},
			{
				label: 'Payments',
				to: ROUTES.ADMIN_PAYMENTS,
				icon: LuReceipt,
				roles: MANAGE_ROLES,
			},
		],
	},
	{
		heading: 'People',
		items: [
			{
				label: 'Users',
				to: ROUTES.ADMIN_USERS,
				icon: LuUsers,
				roles: MANAGE_ROLES,
			},
		],
	},
];

// Sections and items this role can see (empty sections dropped).
export const navForRole = (role) =>
	ADMIN_NAV.map((section) => ({
		...section,
		items: section.items.filter((item) => item.roles.includes(role)),
	})).filter((section) => section.items.length);
