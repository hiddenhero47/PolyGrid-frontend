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
