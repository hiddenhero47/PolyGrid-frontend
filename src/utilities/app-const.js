// Enums mirrored from polygrid-backend. Copy values exactly from the
// model file named beside each one — never invent a value here.

// src/models/userModel.ts
export const SYSTEM_ROLE = {
	SUPER_ADMIN: 'super_admin',
	ADMIN: 'admin',
	CUSTOMER_CARE: 'customer_care',
	USER: 'user',
};

// src/models/userModel.ts — the user's persona (`activeAccountType`)
export const ACCOUNT_TYPE = {
	NORMAL: 'normal',
	BUSINESS: 'business',
};

// src/constants/profileTypes.ts
export const PROFILE_TYPE = {
	CONSULTANCY: 'ConsultancyProfile',
	STORE: 'StoreProfile',
	DIGITAL_CREATOR: 'DigitalCreatorProfile',
	CONTRACTOR: 'ContractorProfile',
	CLIENT: 'ClientProfile',
	LABOR: 'LaborProfile',
};

// src/models/consultancyProfileModel.ts
export const SPECIALIZATION = {
	STRUCTURAL: 'structural',
	GEOTECHNICAL: 'geotechnical',
	HYDRAULIC_WATER: 'hydraulic_water',
	ARCHITECTURAL: 'architectural',
};

// src/models/jobModel.ts
export const JOB_STATUS = {
	PENDING_CONFIRMATION: 'pending_confirmation',
	ACTIVE: 'active',
	COMPLETED: 'completed',
	DISPUTED: 'disputed',
	CANCELLED: 'cancelled',
	CLOSED: 'closed',
};

// src/models/consultancyProfileModel.ts
export const SERVICE_PRICING_MODE = {
	FIXED: 'fixed',
	HOURLY: 'hourly',
	PER_SESSION: 'per_session',
};

// Display labels for enums whose raw values don't read well
export const SPECIALIZATION_LABELS = {
	structural: 'Structural',
	geotechnical: 'Geotechnical',
	hydraulic_water: 'Hydraulic & water',
	architectural: 'Architectural',
};

export const PRICING_MODE_LABELS = {
	fixed: 'Fixed price',
	hourly: 'per hour',
	per_session: 'per session',
};

// Roles that can open the Admin Dashboard — userModel.ts REVIEW_ROLES.
// customer_care is read-only: every route that changes something stays
// admin / super_admin.
export const REVIEW_ROLES = [
	SYSTEM_ROLE.SUPER_ADMIN,
	SYSTEM_ROLE.ADMIN,
	SYSTEM_ROLE.CUSTOMER_CARE,
];
export const MANAGE_ROLES = [SYSTEM_ROLE.SUPER_ADMIN, SYSTEM_ROLE.ADMIN];

export const SYSTEM_ROLE_LABELS = {
	super_admin: 'Super admin',
	admin: 'Admin',
	customer_care: 'Customer care',
	user: 'User',
};

// helpers/currencyReference.ts — the platform is USD-only for now; every
// money field the backend accepts must be this.
export const PLATFORM_CURRENCY = 'USD';

// src/models/planModel.ts
export const PLAN_TIER = {
	FREE: 'free',
	PRO: 'pro',
	ENTERPRISE: 'enterprise',
};

// src/models/verificationModel.ts
export const VERIFICATION_STATUS = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected',
};

export const PROFILE_TYPE_LABELS = {
	ConsultancyProfile: 'Consultant',
	StoreProfile: 'Store',
	DigitalCreatorProfile: 'Digital creator',
	ContractorProfile: 'Contractor',
	ClientProfile: 'Client',
	LaborProfile: 'SiteForce worker',
};

// models/portfolioItem.ts + helpers/fileStorage.ts — portfolio images
export const MAX_PORTFOLIO_ITEMS = 20;
export const MAX_MEDIA_PER_ITEM = 6;
export const PORTFOLIO_ACCEPT = 'image/jpeg,image/png,image/avif';
// avatar / logo uploads (IMAGE_ONLY_MIME_TYPES)
export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

// src/models/contractorProfileModel.ts
export const CONTRACTOR_SPECIALTY = {
	GENERAL_CONTRACTING: 'general_contracting',
	STRUCTURAL: 'structural',
	ELECTRICAL: 'electrical',
	PLUMBING: 'plumbing',
	ROOFING: 'roofing',
	ARCHITECTURAL_DESIGN: 'architectural_design',
	EXCAVATION_EARTHWORKS: 'excavation_earthworks',
	HVAC: 'hvac',
	MASONRY: 'masonry',
	CARPENTRY: 'carpentry',
	PAINTING_FINISHING: 'painting_finishing',
	LANDSCAPING: 'landscaping',
	OTHER: 'other',
};

export const CONTRACTOR_SPECIALTY_LABELS = {
	general_contracting: 'General contracting',
	architectural_design: 'Architectural design',
	excavation_earthworks: 'Excavation & earthworks',
	hvac: 'HVAC',
	painting_finishing: 'Painting & finishing',
};

// src/models/laborProfileModel.ts — also the SiteForce job-board categories
export const LABOR_SKILL = {
	FOREMAN: 'foreman',
	CARPENTRY: 'carpentry',
	PLUMBING: 'plumbing',
	ELECTRICAL: 'electrical',
	MASONRY: 'masonry',
	PAINTING: 'painting',
	WELDING: 'welding',
	ROOFING: 'roofing',
	GENERAL_LABOR: 'general_labor',
	OTHER: 'other',
};

export const LABOR_SKILL_LABELS = {
	foreman: 'Foreman / supervisor',
	general_labor: 'General labour',
};

// src/models/storeProfileModel.ts — a store's categories decide what it
// can sell; removing one deletes the store's products in it.
export const MATERIAL_CATEGORY = {
	CEMENT_CONCRETE: 'cement_concrete',
	STEEL_REINFORCEMENT: 'steel_reinforcement',
	AGGREGATES: 'aggregates',
	BLOCKS_BRICKS: 'blocks_bricks',
	ROOFING: 'roofing',
	TIMBER_WOOD: 'timber_wood',
	DOORS_WINDOWS: 'doors_windows',
	ELECTRICAL: 'electrical',
	PLUMBING: 'plumbing',
	PAINT_FINISHES: 'paint_finishes',
	TILES_FLOORING: 'tiles_flooring',
	TOOLS_EQUIPMENT: 'tools_equipment',
	SAFETY_GEAR: 'safety_gear',
};

export const MATERIAL_CATEGORY_LABELS = {
	cement_concrete: 'Cement & concrete',
	steel_reinforcement: 'Steel & reinforcement',
	aggregates: 'Aggregates (sand, gravel, stone)',
	blocks_bricks: 'Blocks & bricks',
	timber_wood: 'Timber & wood',
	doors_windows: 'Doors & windows',
	paint_finishes: 'Paint & finishes',
	tiles_flooring: 'Tiles & flooring',
	tools_equipment: 'Tools & equipment',
	safety_gear: 'Safety gear',
};

// src/models/productModel.ts
export const STOCK_STATUS = {
	IN_STOCK: 'in_stock',
	OUT_OF_STOCK: 'out_of_stock',
	MADE_TO_ORDER: 'made_to_order',
};
export const MAX_PRODUCT_IMAGES = 6;
export const MAX_SHIPPING_LOCATIONS = 20;
// fileStorage DEFAULT_ALLOWED_MIME_TYPES minus PDF — product photos
export const PRODUCT_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

// src/models/digitalProductModel.ts
export const DIGITAL_PRODUCT_CATEGORY = {
	FLOOR_PLAN: 'floor_plan',
	STRUCTURAL_DRAFTING: 'structural_drafting',
	SITE_LAYOUT_TEMPLATE: 'site_layout_template',
	BOQ_SHEET: 'boq_sheet',
	OTHER: 'other',
};
export const DIGITAL_PRODUCT_CATEGORY_LABELS = {
	site_layout_template: 'Site layout template',
	boq_sheet: 'BOQ sheet',
};
export const MAX_PREVIEW_IMAGES = 6;
export const MAX_DELIVERABLE_FILES = 10;
// what the backend's storage accepts for deliverables (DEFAULT_ALLOWED_MIME_TYPES)
export const DELIVERABLE_ACCEPT =
	'application/pdf,image/jpeg,image/png,image/webp';
