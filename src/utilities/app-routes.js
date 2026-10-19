// Every page path in one place, so links don't hardcode strings. Pages
// that aren't built yet still get their path here — linking to them shows
// the 404 page until they exist.
export const ROUTES = {
	HOME: '/',
	REGISTER: '/register',
	LOGIN: '/login',
	FORGOT_PASSWORD: '/forgot-password',

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

	ABOUT: '/about-us',
	PRIVACY: '/privacy-policy',
	TERMS: '/terms-and-conditions',
};

export const consultantPath = (profile) =>
	`/engineering/${encodeURIComponent(profile?.slug || profile?.id || '')}`;
