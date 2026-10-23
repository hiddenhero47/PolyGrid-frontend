import {
	LuLayoutDashboard,
	LuBriefcaseBusiness,
	LuBadgeCheck,
	LuCreditCard,
	LuHandshake,
	LuMessagesSquare,
	LuBell,
	LuSettings,
	LuGavel,
	LuHardHat,
	LuPackage,
	LuDownload,
	LuContact,
} from 'react-icons/lu';
import { ROUTES } from '../../utilities/app-routes';

// The user's workspace menu (frontend-plan §B). `soon` = not built yet,
// shown greyed so the shape of the workspace is visible.
export const DASHBOARD_NAV = [
	{
		heading: 'Workspace',
		items: [
			{
				label: 'Dashboard',
				to: ROUTES.DASHBOARD,
				icon: LuLayoutDashboard,
				end: true,
			},
		],
	},
	{
		heading: 'Business',
		items: [
			{
				label: 'Profiles',
				to: ROUTES.DASHBOARD_PROFILES,
				icon: LuBriefcaseBusiness,
			},
			{
				label: 'Verification',
				to: ROUTES.DASHBOARD_VERIFICATION,
				icon: LuBadgeCheck,
			},
			{
				label: 'Subscription',
				to: ROUTES.DASHBOARD_SUBSCRIPTION,
				icon: LuCreditCard,
			},
		],
	},
	{
		heading: 'Work',
		items: [
			{ label: 'Jobs', to: ROUTES.DASHBOARD_JOBS, icon: LuHandshake },
			{ label: 'Tenders', to: ROUTES.DASHBOARD_TENDERS, icon: LuGavel },
			{ label: 'SiteForce', to: ROUTES.DASHBOARD_SITEFORCE, icon: LuHardHat },
			{
				label: 'Orders',
				to: ROUTES.DASHBOARD_ORDERS,
				icon: LuPackage,
				soon: true,
			},
			{
				label: 'Purchases',
				to: ROUTES.DASHBOARD_PURCHASES,
				icon: LuDownload,
				soon: true,
			},
		],
	},
	{
		heading: 'Activity',
		items: [
			{
				label: 'Messages',
				to: ROUTES.DASHBOARD_MESSAGES,
				icon: LuMessagesSquare,
				soon: true,
			},
			{
				label: 'Contacts',
				to: ROUTES.DASHBOARD_CONTACTS,
				icon: LuContact,
				soon: true,
			},
			{
				label: 'Notifications',
				to: ROUTES.DASHBOARD_NOTIFICATIONS,
				icon: LuBell,
				countKey: 'unreadNotifications',
			},
		],
	},
	{
		heading: 'Account',
		items: [
			{ label: 'Settings', to: ROUTES.DASHBOARD_SETTINGS, icon: LuSettings },
		],
	},
];
