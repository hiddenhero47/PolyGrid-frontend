import {
	LuLayoutDashboard,
	LuBriefcaseBusiness,
	LuBadgeCheck,
	LuCreditCard,
	LuHandshake,
	LuMessagesSquare,
	LuBell,
	LuSettings,
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
		heading: 'Activity',
		items: [
			{ label: 'Jobs', icon: LuHandshake, soon: true },
			{ label: 'Messages', icon: LuMessagesSquare, soon: true },
			{ label: 'Notifications', icon: LuBell, soon: true },
		],
	},
	{
		heading: 'Account',
		items: [{ label: 'Settings', icon: LuSettings, soon: true }],
	},
];
