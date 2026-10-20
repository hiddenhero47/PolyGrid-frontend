// Every page path in one place, so links don't hardcode strings. Pages
// that aren't built yet still get their path here — linking to them shows
// the 404 page until they exist.
export const ROUTES = {
	HOME: '/',
	REGISTER: '/register',
	LOGIN: '/login',
	FORGOT_PASSWORD: '/forgot-password',
	VERIFY_EMAIL: '/verify-email/:token',

	// frontend-plan §A — the four pillars' browse pages
	ENGINEERING: '/engineering',
	TENDERS: '/tenders',
	CONTRACTORS: '/contractors',
	STORE: '/store',
	DIGITAL_STORE: '/store/digital',
	SITEFORCE: '/siteforce',
	WORKERS: '/siteforce/workers',

	// detail pages — build with the helpers below
	CONSULTANT: '/engineering/:idOrSlug',

	// User Dashboard — frontend-plan §B
	DASHBOARD: '/dashboard',
	DASHBOARD_PROFILES: '/dashboard/profiles',
	DASHBOARD_CONSULTANCY: '/dashboard/profiles/consultancy',
	DASHBOARD_CONTRACTOR: '/dashboard/profiles/contractor',
	DASHBOARD_CLIENT: '/dashboard/profiles/client',
	DASHBOARD_SETTINGS: '/dashboard/settings',
	DASHBOARD_VERIFICATION: '/dashboard/verification',
	DASHBOARD_SUBSCRIPTION: '/dashboard/subscription',

	// Admin Dashboard — frontend-plan §C
	ADMIN: '/admin',
	ADMIN_VERIFICATIONS: '/admin/verifications',
	ADMIN_PLANS: '/admin/plans',
	ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',

	ABOUT: '/about-us',
	PRIVACY: '/privacy-policy',
	TERMS: '/terms-and-conditions',
};

// Where a signed-in user "lives": staff land on the Admin Dashboard,
// everyone else on their workspace (frontend-plan §B.1).
const STAFF_ROLES = ['super_admin', 'admin', 'customer_care'];
export const homeForUser = (user) =>
	STAFF_ROLES.includes(user?.systemRole) ? ROUTES.ADMIN : ROUTES.DASHBOARD;

export const consultantPath = (profile) =>
	`/engineering/${encodeURIComponent(profile?.slug || profile?.id || '')}`;
