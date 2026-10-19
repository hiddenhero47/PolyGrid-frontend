import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { toast } from '../../layouts/toast/toast-handler';
import { ROUTES } from '../../utilities/app-routes';
import AuthHeader from './elements/auth-header';
import { AuthSwitch } from './elements/index.style';

// Best guess at the visitor's country for the phone field, from the
// browser language ('en-NG' → NG). They can change it in the field.
const guessCountry = () => {
	const region = navigator.language?.split('-')[1];
	return region && region.length === 2 ? region.toUpperCase() : 'NG';
};

// frontend-plan §A.2 — POST /api/users. One account for every pillar:
// signing up never asks which pillar; business profiles come later.
function Register() {
	const navigate = useNavigate();
	const location = useLocation();
	const { mutate: register, isPending } = AuthServices.register();

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
			fullName: '',
			email: '',
			phoneNumber: { number: '', country: guessCountry() },
			password: '',
			confirmPassword: '',
			terms: false,
		},
		validationSchema: registerValidation,
		onSubmit: ({ fullName, email, phoneNumber, password }) => {
			register(
				{
					fullName: fullName.trim(),
					email: email.trim(),
					password,
					// optional — only sent if they filled it in
					...(phoneNumber.number ? { phoneNumber } : {}),
				},
				{
					onSuccess: (user) => {
						toast.success(
							`Welcome to PolyGrid, ${user.fullName?.split(' ')[0] || ''}`.trim()
						);
						navigate(location.state?.from || ROUTES.HOME, { replace: true });
					},
				}
			);
		},
	});

	const err = (field) => (touched[field] && errors[field]) || false;

	return (
		<>
			<AuthHeader
				eyebrow="Create your account"
				title="Join PolyGrid"
				subtitle="One account for consultants, tenders, materials and site work. Set up business profiles any time after."
			/>

			<form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
				<CustomInput
					label="Full name"
					name="fullName"
					autoComplete="name"
					placeholder="e.g. Ada Okafor"
					required
					value={values.fullName}
					onChange={handleChange}
					onBlur={handleBlur}
					isError={err('fullName')}
					errormessage={errors.fullName}
				/>
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
