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
	CONTRACTOR: '/contractors/:idOrSlug',
	WORKER: '/siteforce/workers/:idOrSlug',
	SHOP: '/store/shops/:idOrSlug',
	PRODUCT: '/store/products/:id',
	CREATOR: '/store/creators/:idOrSlug',
	DIGITAL_PRODUCT: '/store/digital/:id',
	CLIENT: '/clients/:id',

	// User Dashboard — frontend-plan §B
	DASHBOARD: '/dashboard',
	DASHBOARD_PROFILES: '/dashboard/profiles',
	DASHBOARD_CONSULTANCY: '/dashboard/profiles/consultancy',
	DASHBOARD_CONTRACTOR: '/dashboard/profiles/contractor',
	DASHBOARD_CLIENT: '/dashboard/profiles/client',
	DASHBOARD_LABOR: '/dashboard/profiles/siteforce',
	DASHBOARD_STORE: '/dashboard/profiles/store',
	DASHBOARD_CREATOR: '/dashboard/profiles/digital-creator',
	DASHBOARD_SETTINGS: '/dashboard/settings',
	DASHBOARD_NOTIFICATIONS: '/dashboard/notifications',
	DASHBOARD_JOBS: '/dashboard/jobs',
	DASHBOARD_TENDERS: '/dashboard/tenders',
	DASHBOARD_SITEFORCE: '/dashboard/siteforce',
	DASHBOARD_ORDERS: '/dashboard/orders',
	DASHBOARD_PURCHASES: '/dashboard/purchases',
	DASHBOARD_CONTACTS: '/dashboard/contacts',
	DASHBOARD_MESSAGES: '/dashboard/messages',
	DASHBOARD_VERIFICATION: '/dashboard/verification',
	DASHBOARD_SUBSCRIPTION: '/dashboard/subscription',

	// Admin Dashboard — frontend-plan §C
	ADMIN: '/admin',
	ADMIN_VERIFICATIONS: '/admin/verifications',
	ADMIN_PLANS: '/admin/plans',
	ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
	ADMIN_USERS: '/admin/users',
	ADMIN_DIGITAL_REVIEW: '/admin/digital-products',
	ADMIN_DISPUTES: '/admin/disputes',
	ADMIN_REFUNDS_PAYOUTS: '/admin/refunds-payouts',
	ADMIN_PAYMENTS: '/admin/payments',
	ADMIN_JOBS: '/admin/jobs',

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

export const contractorPath = (profile) =>
	`/contractors/${encodeURIComponent(profile?.slug || profile?.id || '')}`;

export const workerPath = (profile) =>
	`/siteforce/workers/${encodeURIComponent(profile?.slug || profile?.id || '')}`;

export const storePath = (store) =>
	`/store/shops/${encodeURIComponent(store?.slug || store?.id || '')}`;
export const productPath = (product) =>
	`/store/products/${encodeURIComponent(product?.id || '')}`;
export const creatorPath = (creator) =>
	`/store/creators/${encodeURIComponent(creator?.slug || creator?.id || '')}`;
export const digitalProductPath = (product) =>
	`/store/digital/${encodeURIComponent(product?.id || '')}`;
// client (poster) pages are by id only — they're reached from a job /
// project / opening, never browsed
export const clientPath = (client) =>
	`/clients/${encodeURIComponent(client?.id || '')}`;
