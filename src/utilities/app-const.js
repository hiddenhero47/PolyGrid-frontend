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
