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
