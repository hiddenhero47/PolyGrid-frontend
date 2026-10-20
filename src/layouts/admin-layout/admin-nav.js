import {
	LuLayoutDashboard,
	LuBadgeCheck,
	LuLayers,
	LuCreditCard,
	LuGavel,
	LuWallet,
	LuShieldAlert,
	LuUsers,
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
			{ label: 'Disputes', icon: LuGavel, roles: REVIEW_ROLES, soon: true },
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
				icon: LuWallet,
				roles: MANAGE_ROLES,
				soon: true,
			},
		],
	},
	{
		heading: 'People',
		items: [{ label: 'Users', icon: LuUsers, roles: MANAGE_ROLES, soon: true }],
	},
];

// Sections and items this role can see (empty sections dropped).
export const navForRole = (role) =>
	ADMIN_NAV.map((section) => ({
		...section,
		items: section.items.filter((item) => item.roles.includes(role)),
	})).filter((section) => section.items.length);
