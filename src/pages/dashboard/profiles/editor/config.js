import {
	PROFILE_TYPE,
	SPECIALIZATION,
	SPECIALIZATION_LABELS,
	CONTRACTOR_SPECIALTY,
	CONTRACTOR_SPECIALTY_LABELS,
	LABOR_SKILL,
	LABOR_SKILL_LABELS,
} from '../../../../utilities/app-const';
import { ROUTES } from '../../../../utilities/app-routes';
import { enumToOptions } from '../../../../utilities/basic-functions';

// What each business profile's editor has (frontend-plan §B.3a/b/f). One
// generic editor page reads this, so a pillar is mostly a config entry.
//   nameField   — the "what do I call myself" field (headline / displayName)
//   disciplines — the multi-choice "what I do" field, if the pillar has one
//   years       — has yearsOfExperience
//   tabs        — editor sections after Details
//   live        — what "fully set up" means for this pillar (go-live strip)
export const PROFILE_EDITORS = {
	[PROFILE_TYPE.CONSULTANCY]: {
		route: ROUTES.DASHBOARD_CONSULTANCY,
		label: 'Engineering consultant',
		pillar: 'PolyGrid Engineering',
		createTitle: 'Become a consultant',
		createSubtitle:
			'Start with the basics — you can add services, mentorship and portfolio projects next. Your profile goes public once it’s verified and you have an active plan.',
		nameField: 'headline',
		nameLabel: 'Headline',
		namePlaceholder: 'e.g. Okonkwo Structural Consult',
		nameHint:
			'Your practice or professional name — it’s the title of your public page.',
		bioPlaceholder:
			'What you design, check or inspect, the kinds of projects you take on, and where you work.',
		disciplines: {
			field: 'specializations',
			label: 'Disciplines',
			options: enumToOptions(SPECIALIZATION, SPECIALIZATION_LABELS),
		},
		years: true,
		tabs: ['services', 'mentorship', 'portfolio', 'links'],
		afterCreateTab: 'services',
		live: {
			on: 'This profile shows in public search.',
			off: 'All four are needed before this profile shows in public search.',
		},
	},
	[PROFILE_TYPE.CONTRACTOR]: {
		route: ROUTES.DASHBOARD_CONTRACTOR,
		label: 'Contractor',
		pillar: 'PolyGrid Tenders',
		createTitle: 'Become a contractor',
		createSubtitle:
			'Set up your company profile, then add past projects. Once verified and on a plan, you can bid on tender projects and be hired directly.',
		nameField: 'headline',
		nameLabel: 'Company / trading name',
		namePlaceholder: 'e.g. Delta Builds Ltd',
		nameHint: 'The name clients see on your bids and your public page.',
		bioPlaceholder:
			'What you build, crew size, equipment, the regions you cover and the kinds of projects you take on.',
		disciplines: {
			field: 'specialties',
			label: 'Specialties',
			options: enumToOptions(CONTRACTOR_SPECIALTY, CONTRACTOR_SPECIALTY_LABELS),
			columns: 2,
		},
		years: true,
		tabs: ['portfolio', 'links'],
		afterCreateTab: 'portfolio',
		live: {
			on: 'This profile shows in search and can bid on tenders.',
			off: 'All four are needed before you can bid on tenders and show in search.',
		},
	},
	[PROFILE_TYPE.LABOR]: {
		route: ROUTES.DASHBOARD_LABOR,
		label: 'SiteForce worker',
		pillar: 'PolyGrid SiteForce',
		createTitle: 'Find site work',
		createSubtitle:
			'Set up your worker profile and show past work. Once verified and on a plan, you can apply to site jobs near you and be booked directly.',
		nameField: 'headline',
		nameLabel: 'Name or crew name',
		namePlaceholder: 'e.g. Emeka Obi — tiler & mason',
		nameHint: 'How clients see you on job applications and your public page.',
		bioPlaceholder:
			'Your trade, the tools you bring, crew size, where you’ll travel to and the kind of sites you work on.',
		disciplines: {
			field: 'skills',
			label: 'Trades',
			options: enumToOptions(LABOR_SKILL, LABOR_SKILL_LABELS),
			columns: 2,
		},
		years: true,
		tabs: ['portfolio', 'links'],
		afterCreateTab: 'portfolio',
		live: {
			on: 'This profile shows in search and can apply to site jobs.',
			off: 'All four are needed before you can apply to site jobs and show in search.',
		},
	},
	[PROFILE_TYPE.CLIENT]: {
		route: ROUTES.DASHBOARD_CLIENT,
		label: 'Client / poster',
		pillar: 'Tenders & SiteForce',
		createTitle: 'Post work on PolyGrid',
		createSubtitle:
			'A client profile is who you are when you post tender projects and site jobs. It needs verification and an active plan before you can post — contractors and workers travel to sites you control.',
		nameField: 'displayName',
		nameLabel: 'Display name',
		namePlaceholder: 'e.g. Harbour Estates or Ada Nwosu',
		nameHint:
			'Your company or your own name — shown on projects and jobs you post.',
		bioPlaceholder: 'Who you are and the kind of work you usually post.',
		disciplines: null,
		years: false,
		tabs: [],
		live: {
			on: 'You can post tender projects and site jobs.',
			off: 'All four are needed before you can post tender projects and site jobs.',
		},
	},
};

export const TAB_LABELS = {
	details: 'Details',
	services: 'Services',
	mentorship: 'Mentorship',
	portfolio: 'Portfolio',
	links: 'Links',
};
