import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { LuArrowRight, LuArrowLeft, LuShieldCheck } from 'react-icons/lu';
import { AppButton } from '../../components/button';
import {
	CustomInput,
	CustomPassword,
	CustomOtp,
} from '../../components/form-components';
import AuthServices from '../../features/services/custom-hooks/auth';
import { loginValidation } from '../../features/validations/auth-validation';
import { toast } from '../../layouts/toast/toast-handler';
import { ROUTES, homeForUser } from '../../utilities/app-routes';
import AuthHeader from './elements/auth-header';
import { AuthSwitch } from './elements/index.style';

const CODE_LENGTH = 6;

// frontend-plan §A.3 — POST /api/users/login. Two steps when the account
// has 2FA: the first attempt comes back 2FA_REQUIRED (no toast — the API
// client marks it is2FARequired), so we ask for the authenticator code and
// send the same credentials again with `token`.
function Login() {
	const navigate = useNavigate();
	const location = useLocation();
	const { mutate: login, isPending } = AuthServices.login();

	const [step, setStep] = useState('credentials'); // | 'twoFactor'
	const [code, setCode] = useState('');
	const [codeError, setCodeError] = useState('');

	const finish = (user) => {
		toast.success(`Welcome back, ${user.fullName?.split(' ')[0] || ''}`.trim());
		navigate(location.state?.from || homeForUser(user), { replace: true });
	};

	const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
		useFormik({
			initialValues: { email: '', password: '' },
			validationSchema: loginValidation,
			onSubmit: ({ email, password }) => {
				login(
					{ email: email.trim(), password },
					{
						onSuccess: finish,
						onError: (error) => {
							if (error.twoFactorCode === '2FA_REQUIRED') {
								setStep('twoFactor');
								setCode('');
								setCodeError('');
							}
						},
					}
				);
			},
		});

	const submitCode = (token = code) => {
		if (token.length !== CODE_LENGTH) {
			setCodeError(`Enter the ${CODE_LENGTH}-digit code`);
			return;
		}
		login(
			{ email: values.email.trim(), password: values.password, token },
			{
				onSuccess: finish,
				onError: (error) => {
					if (error.twoFactorCode === '2FA_INVALID') {
						setCodeError(
							"That code didn't work — check your app and try again"
						);
						setCode('');
					}
				},
			}
		);
	};

	const err = (field) => (touched[field] && errors[field]) || false;

	if (step === 'twoFactor') {
		return (
			<>
				<AuthHeader
					eyebrow="Two-step verification"
					title="Enter your code"
					subtitle={
						<>
							Open your authenticator app and enter the {CODE_LENGTH}-digit code
							for <strong>{values.email}</strong>.
						</>
					}
				/>
				<form
					noValidate
					onSubmit={(e) => {
						e.preventDefault();
						submitCode();
					}}
					className="flex flex-col gap-6"
				>
					<CustomOtp
						label="Authentication code"
						length={CODE_LENGTH}
						value={code}
						onChange={(next) => {
							setCode(next);
							setCodeError('');
						}}
						onComplete={submitCode}
						isError={Boolean(codeError)}
						errormessage={codeError}
						disabled={isPending}
						autoFocus
					/>
					<AppButton
						type="submit"
						icon={<LuShieldCheck />}
						disabled={isPending}
						className="w-full"
					>
						{isPending ? 'Checking…' : 'Verify and sign in'}
					</AppButton>
				</form>
				<AuthSwitch>
					<button type="button" onClick={() => setStep('credentials')}>
						<LuArrowLeft className="mr-1 inline" aria-hidden="true" />
						Use a different account
					</button>
				</AuthSwitch>
			</>
		);
	}

	return (
		<>
			<AuthHeader
				eyebrow="Welcome back"
				title="Sign in"
				subtitle="Pick up where you left off — jobs, tenders, orders and messages."
			/>

			<form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
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
				<div className="flex flex-col gap-2">
					<CustomPassword
						label="Password"
						name="password"
						autoComplete="current-password"
						required
						value={values.password}
						onChange={handleChange}
						onBlur={handleBlur}
						isError={err('password')}
						errormessage={errors.password}
					/>
					<Link
						to={ROUTES.FORGOT_PASSWORD}
						className="self-end text-sm font-semibold text-(--pg-text-link) hover:underline"
					>
						Forgot password?
					</Link>
				</div>

				<AppButton
					type="submit"
					icon={<LuArrowRight />}
					disabled={isPending}
					className="mt-2 w-full"
				>
					{isPending ? 'Signing in…' : 'Sign in'}
				</AppButton>
			</form>

			<AuthSwitch>
				New to PolyGrid?{' '}
				<Link to={ROUTES.REGISTER} state={location.state}>
					Create an account
				</Link>
			</AuthSwitch>
		</>
	);
}

export default Login;
