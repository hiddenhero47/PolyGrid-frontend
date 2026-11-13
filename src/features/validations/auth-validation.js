import * as yup from 'yup';
import {
	emailField,
	newPasswordField,
	confirmPasswordField,
	phoneField,
	otpField,
} from './common';

// Mirrors polygrid-backend src/validators/user/userValidator.ts
// (registerUserSchema, loginUserSchema, requestResetSchema,
// resetPasswordSchema) — same fields, never looser.

export const registerValidation = yup.object({
	firstName: yup.string().trim().max(50, 'That’s too long'),
	lastName: yup.string().trim().max(50, 'That’s too long'),
	email: emailField(),
	phoneNumber: phoneField(),
	password: newPasswordField(),
	confirmPassword: confirmPasswordField(),
	terms: yup.boolean().oneOf([true], 'Accept the terms to continue'),
});

export const loginValidation = yup.object({
	email: emailField(),
	password: yup.string().required('Password is required'),
});

export const twoFactorValidation = yup.object({
	token: otpField(6),
});

export const requestResetValidation = yup.object({
	email: emailField(),
});

export const resetPasswordValidation = yup.object({
	password: newPasswordField(),
	confirmPassword: confirmPasswordField(),
});
