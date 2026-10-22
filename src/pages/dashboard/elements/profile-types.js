import {
	LuDraftingCompass,
	LuHardHat,
	LuWrench,
	LuStore,
	LuFileCode2,
	LuClipboardList,
} from 'react-icons/lu';
import { PROFILE_TYPE } from '../../../utilities/app-const';
import {
	ROUTES,
	consultantPath,
	contractorPath,
	workerPath,
} from '../../../utilities/app-routes';

// What each business profile is, for the Profiles hub (frontend-plan
// §B.3). `editor` = its editor route once built; `publicPath` = its
// public page once that exists. The name shown for a profile comes from
// whichever "what do I call myself" field that type has.
export const PROFILE_TYPES = [
	{
		type: PROFILE_TYPE.CONSULTANCY,
		label: 'Engineering consultant',
		pillar: 'PolyGrid Engineering',
		icon: LuDraftingCompass,
		pitch:
			'Sell design, review and inspection services, and mentor engineers on the way up.',
		editor: ROUTES.DASHBOARD_CONSULTANCY,
		publicPath: consultantPath,
		name: (p) => p.headline,
	},
	{
		type: PROFILE_TYPE.CONTRACTOR,
		label: 'Contractor',
		pillar: 'PolyGrid Tenders',
		icon: LuHardHat,
		pitch: 'Bid on sealed tender projects and get hired directly for builds.',
		editor: ROUTES.DASHBOARD_CONTRACTOR,
		publicPath: contractorPath,
		name: (p) => p.headline,
	},
	{
		type: PROFILE_TYPE.LABOR,
		label: 'SiteForce worker',
		pillar: 'PolyGrid SiteForce',
		icon: LuWrench,
		pitch: 'Find site work near you and get booked for your trade.',
		editor: ROUTES.DASHBOARD_LABOR,
		publicPath: workerPath,
		name: (p) => p.headline || p.displayName,
	},
	{
		type: PROFILE_TYPE.STORE,
		label: 'Materials store',
		pillar: 'PolyGrid Store',
		icon: LuStore,
		pitch:
			'List building materials and take orders from contractors and clients.',
		name: (p) => p.storeName,
	},
	{
		type: PROFILE_TYPE.DIGITAL_CREATOR,
		label: 'Digital creator',
		pillar: 'PolyGrid Store',
		icon: LuFileCode2,
		pitch: 'Sell drawings, templates and calculation sheets as downloads.',
		name: (p) => p.displayName,
	},
	{
		type: PROFILE_TYPE.CLIENT,
		label: 'Client / poster',
		pillar: 'Tenders & SiteForce',
		icon: LuClipboardList,
		pitch: 'Post tender projects and site jobs, and hire the people who bid.',
		editor: ROUTES.DASHBOARD_CLIENT,
		name: (p) => p.displayName,
	},
];

export const profileTypeMeta = (type) =>
	PROFILE_TYPES.find((meta) => meta.type === type);
