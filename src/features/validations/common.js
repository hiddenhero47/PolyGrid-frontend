import * as yup from 'yup';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Shared yup pieces. Every rule here is at least as strict as the
// backend's validator for the same field (polygrid-backend
// src/validators/**) — never looser.

export const emailField = () =>
	yup
		.string()
		.trim()
		.email('Enter a valid email address')
		.required('Email is required');

// The backend only requires a password; 8+ characters is a frontend floor
// for new passwords (sign-up, reset), not checked on login.
export const newPasswordField = () =>
	yup
		.string()
		.min(8, 'Use at least 8 characters')
		.required('Password is required');

export const confirmPasswordField = (ref = 'password') =>
	yup
		.string()
		.oneOf([yup.ref(ref)], "Passwords don't match")
		.required('Confirm your password');

// CustomPhone's value: { number, country }. Optional unless `required`.
export const isValidPhone = (value) =>
	Boolean(
		value?.number &&
		parsePhoneNumberFromString(value.number, value.country)?.isValid()
	);

export const phoneField = ({ required = false } = {}) =>
	yup
		.object({ number: yup.string(), country: yup.string() })
		.test('phone', 'Enter a valid phone number', (value) =>
			!value?.number ? !required : isValidPhone(value)
		);

export const otpField = (length = 6) =>
	yup
		.string()
		.matches(new RegExp(`^\\d{${length}}$`), `Enter the ${length}-digit code`)
		.required(`Enter the ${length}-digit code`);
