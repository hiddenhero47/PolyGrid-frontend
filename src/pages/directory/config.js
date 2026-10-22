import { LuHardHat, LuWrench } from 'react-icons/lu';
import {
	PROFILE_TYPE,
	CONTRACTOR_SPECIALTY,
	CONTRACTOR_SPECIALTY_LABELS,
	LABOR_SKILL,
	LABOR_SKILL_LABELS,
} from '../../utilities/app-const';
import { ROUTES, contractorPath, workerPath } from '../../utilities/app-routes';
import {
	enumToOptions,
	specialtyLabel,
	skillLabel,
} from '../../utilities/basic-functions';

// The public directories that share one browse + profile pattern
// (frontend-plan §A.7/A.8 contractors, §A.15/A.16 SiteForce workers).
// Engineering consultants stay on their own pages (services, mentorship).
//   api        — backend base path (DirectoryServices)
//   filter     — the one "what they do" filter the backend supports
//   field      — the profile's array of those values
export const DIRECTORIES = {
	contractor: {
		profileType: PROFILE_TYPE.CONTRACTOR,
		api: '/api/contractor-profiles',
		route: ROUTES.CONTRACTORS,
		path: contractorPath,
		pillar: 'PolyGrid Tenders',
		singular: 'contractor',
		plural: 'contractors',
		label: 'Contractor',
		icon: LuHardHat,
		title: 'Contractors',
		subtitle:
			'Verified builders and trade firms — general contracting, structural, electrical, plumbing, roofing and more. Hire one directly, or post a project to the sealed tender board.',
		filter: 'specialty',
		filterLabel: 'Specialty',
		filterAny: 'Any specialty',
		options: enumToOptions(CONTRACTOR_SPECIALTY, CONTRACTOR_SPECIALTY_LABELS),
		field: 'specialties',
		valueLabel: specialtyLabel,
		portfolioTitle: 'Past projects',
		joinRoute: ROUTES.DASHBOARD_CONTRACTOR,
		joinLabel: 'List your company',
		board: { route: ROUTES.TENDERS, label: 'About tenders' },
		workWith:
			'Hire this contractor directly for a job, or post your project to the sealed tender board and let verified contractors bid.',
	},
	worker: {
		profileType: PROFILE_TYPE.LABOR,
		api: '/api/labor-profiles',
		route: ROUTES.WORKERS,
		path: workerPath,
		pillar: 'PolyGrid SiteForce',
		singular: 'worker',
		plural: 'workers',
		label: 'SiteForce worker',
		icon: LuWrench,
		title: 'Tradespeople',
		subtitle:
			'Verified carpenters, electricians, plumbers, masons, welders and site crews. Book someone directly, or post a site job and let workers near you apply.',
		filter: 'skill',
		filterLabel: 'Trade',
		filterAny: 'Any trade',
		options: enumToOptions(LABOR_SKILL, LABOR_SKILL_LABELS),
		field: 'skills',
		valueLabel: skillLabel,
		portfolioTitle: 'Past work',
		joinRoute: ROUTES.DASHBOARD_LABOR,
		joinLabel: 'Offer your trade',
		board: { route: ROUTES.SITEFORCE, label: 'About SiteForce' },
		workWith:
			'Book this worker directly, or post a site job on SiteForce and let verified workers near the site apply.',
	},
};
