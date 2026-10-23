import {
	LuBadgeCheck,
	LuBadgeX,
	LuGavel,
	LuHardHat,
	LuCircleX,
	LuListChecks,
	LuScale,
	LuWallet,
	LuBell,
} from 'react-icons/lu';
import { ROUTES } from './app-routes';

// What each notification type (polygrid-backend models/notificationModel.ts)
// looks like and where it leads. Anything carrying a jobId opens that job
// (a tender award and an accepted application both create one).
const jobLink = (data) =>
	data?.jobId
		? `${ROUTES.DASHBOARD_JOBS}/${data.jobId}`
		: ROUTES.DASHBOARD_JOBS;

const NOTIFICATION_META = {
	verification_approved: {
		icon: LuBadgeCheck,
		tone: 'success',
		to: () => ROUTES.DASHBOARD_VERIFICATION,
	},
	verification_rejected: {
		icon: LuBadgeX,
		tone: 'error',
		to: () => ROUTES.DASHBOARD_VERIFICATION,
	},
	tender_bid_awarded: {
		icon: LuGavel,
		tone: 'success',
		to: jobLink,
	},
	job_application_accepted: {
		icon: LuHardHat,
		tone: 'success',
		to: jobLink,
	},
	job_application_rejected: {
		icon: LuCircleX,
		tone: 'neutral',
		to: (data) =>
			data?.jobOpeningId
				? `${ROUTES.DASHBOARD_SITEFORCE}/${data.jobOpeningId}`
				: `${ROUTES.DASHBOARD_SITEFORCE}?view=applications`,
	},
	job_stage_done: {
		icon: LuListChecks,
		tone: 'info',
		to: jobLink,
	},
	job_dispute_resolved: {
		icon: LuScale,
		tone: 'info',
		to: jobLink,
	},
	payment_request_decided: {
		icon: LuWallet,
		tone: 'info',
		to: jobLink,
	},
};

const FALLBACK = { icon: LuBell, tone: 'neutral', to: () => ROUTES.DASHBOARD };

export const notificationMeta = (notification) =>
	NOTIFICATION_META[notification?.type] || FALLBACK;

export const notificationLink = (notification) =>
	notificationMeta(notification).to(notification?.data || {});

// "just now", "5 min ago", "3 h ago", "2 d ago", then a date
export const timeAgo = (value) => {
	const then = new Date(value).getTime();
	if (Number.isNaN(then)) return '';
	const seconds = Math.max(0, (Date.now() - then) / 1000);
	if (seconds < 60) return 'just now';
	if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
	if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} d ago`;
	return new Date(value).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
	});
};
