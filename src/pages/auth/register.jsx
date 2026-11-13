import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { LuArrowRight } from 'react-icons/lu';
import { AppButton } from '../../components/button';
import {
	CustomInput,
	CustomPassword,
	CustomPhone,
	CustomCheckbox,
} from '../../components/form-components';
import AuthServices from '../../features/services/custom-hooks/auth';
import { registerValidation } from '../../features/validations/auth-validation';
import { ROUTES } from '../../utilities/app-routes';
import AuthHeader from './elements/auth-header';
import CheckEmail from './elements/check-email';
import { AuthSwitch } from './elements/index.style';

// Best guess at the visitor's country for the phone field, from the
// browser language ('en-NG' → NG). They can change it in the field.
const guessCountry = () => {
	const region = navigator.language?.split('-')[1];
	return region && region.length === 2 ? region.toUpperCase() : 'NG';
};

// frontend-plan §A.2 — POST /api/users. One account for every pillar:
// signing up never asks which pillar; business profiles come later. The
// account can't sign in until the emailed link is opened, so this ends on
// "check your email", not in the dashboard.
function Register() {
	const location = useLocation();
	const { mutate: register, isPending } = AuthServices.register();
	const [sentTo, setSentTo] = useState('');

	const {
		values,
		errors,
		touched,
		handleChange,
		handleBlur,
		handleSubmit,
		setFieldValue,
	} = useFormik({
		initialValues: {
			firstName: '',
			lastName: '',
			email: '',
			phoneNumber: { number: '', country: guessCountry() },
			password: '',
			confirmPassword: '',
			terms: false,
		},
		validationSchema: registerValidation,
		onSubmit: ({ firstName, lastName, email, phoneNumber, password }) => {
			const first = firstName.trim();
			const last = lastName.trim();
			register(
				{
					// Names are optional so signing up stays quick. Without them
					// the backend files the legal name as "John Doe" until it's
					// set in Settings, so give people something better to be
					// shown as: their email's local part.
					...(first && { firstName: first }),
					...(last && { lastName: last }),
					...(!first && !last && { userName: email.trim().split('@')[0] }),
					email: email.trim(),
					password,
					// optional — only sent if they filled it in
					...(phoneNumber.number ? { phoneNumber } : {}),
				},
				{
					onSuccess: (user) => setSentTo(user.email),
				}
			);
		},
	});

	const err = (field) => (touched[field] && errors[field]) || false;

	if (sentTo) {
		return (
			<CheckEmail
				email={sentTo}
				title="Check your email"
				text={
					<>
						We sent a link to <strong>{sentTo}</strong>. Open it to confirm your
						account, then sign in. It lasts 24 hours.
					</>
				}
			>
				<AuthSwitch className="self-stretch">
					Already verified?{' '}
					<Link to={ROUTES.LOGIN} state={location.state}>
						Sign in
					</Link>
				</AuthSwitch>
			</CheckEmail>
		);
	}

	return (
		<>
			<AuthHeader
				eyebrow="Create your account"
				title="Join PolyGrid"
				subtitle="One account for consultants, tenders, materials and site work. Set up business profiles any time after."
			/>

			<form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
				<div className="grid gap-4 sm:grid-cols-2">
					<CustomInput
						label="First name"
						name="firstName"
						autoComplete="given-name"
						placeholder="e.g. Ada"
						value={values.firstName}
						onChange={handleChange}
						onBlur={handleBlur}
						isError={err('firstName')}
						errormessage={errors.firstName}
					/>
					<CustomInput
						label="Last name"
						name="lastName"
						autoComplete="family-name"
						placeholder="e.g. Okafor"
						value={values.lastName}
						onChange={handleChange}
						onBlur={handleBlur}
						isError={err('lastName')}
						errormessage={errors.lastName}
					/>
					<p className="-mt-2 text-xs text-(--pg-text-secondary) sm:col-span-2">
						Optional. Use the name on your ID: it’s the name we pay or refund
						you under. You can add it later in Settings.
					</p>
				</div>
				<CustomInput
					label="Email"
					name="email"
					type="email"
					autoComplete="email"
					placeholder="you@company.com"
					required
					value={values.email}
					onChange={handleChange}
					onBlur={handleBlur}
					isError={err('email')}
					errormessage={errors.email}
				/>
				<CustomPhone
					label="Phone number"
					name="phoneNumber"
					hint="Optional — clients and contractors can reach you faster."
					value={values.phoneNumber}
					setFieldValue={setFieldValue}
					onBlur={handleBlur}
					isError={err('phoneNumber')}
					errormessage={errors.phoneNumber}
				/>
				<CustomPassword
					label="Password"
					name="password"
					autoComplete="new-password"
					placeholder="At least 8 characters"
					required
					value={values.password}
					onChange={handleChange}
					onBlur={handleBlur}
					isError={err('password')}
					errormessage={errors.password}
				/>
				<CustomPassword
					label="Confirm password"
					name="confirmPassword"
					autoComplete="new-password"
					required
					value={values.confirmPassword}
					onChange={handleChange}
					onBlur={handleBlur}
					isError={err('confirmPassword')}
					errormessage={errors.confirmPassword}
				/>
				<CustomCheckbox
					name="terms"
					checked={values.terms}
					onChange={handleChange}
					onBlur={handleBlur}
					isError={err('terms')}
					errormessage={errors.terms}
				>
					I agree to the{' '}
					<Link
						to={ROUTES.TERMS}
						className="font-semibold text-(--pg-text-link) hover:underline"
					>
						terms
					</Link>{' '}
					and{' '}
					<Link
						to={ROUTES.PRIVACY}
						className="font-semibold text-(--pg-text-link) hover:underline"
					>
						privacy policy
					</Link>
				</CustomCheckbox>

				<AppButton
					type="submit"
					icon={<LuArrowRight />}
					disabled={isPending}
					className="mt-2 w-full"
				>
					{isPending ? 'Creating account…' : 'Create account'}
				</AppButton>
			</form>

			<AuthSwitch>
				Already have an account?{' '}
				<Link to={ROUTES.LOGIN} state={location.state}>
					Sign in
				</Link>
			</AuthSwitch>
		</>
	);
}

export default Register;
