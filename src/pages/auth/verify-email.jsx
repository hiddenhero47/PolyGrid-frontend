import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuCircleCheck, LuMailX, LuArrowRight, LuSend } from 'react-icons/lu';
import AuthServices from '../../features/services/custom-hooks/auth';
import { selectIsAuthenticated } from '../../store/slice/auth';
import AppLoader from '../../components/loader';
import { AppButton } from '../../components/button';
import { CustomInput } from '../../components/form-components';
import { emailField } from '../../features/validations/common';
import { ROUTES } from '../../utilities/app-routes';
import AuthHeader from './elements/auth-header';
import { AuthNotice, AuthSwitch } from './elements/index.style';

// The link from the verification email: /verify-email/:token
// (userController sendVerificationEmail builds it from FRONTEND_URL).
// Verifies on load; if the link is bad or expired, offers a new one.
function VerifyEmail() {
	const { token } = useParams();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const { user } = useSelector((state) => state.auth);
	const { data, isPending, isError, error } = AuthServices.verifyEmail(token);
	const resend = AuthServices.resendVerification();

	const form = useFormik({
		initialValues: { email: user?.email || '' },
		validationSchema: yup.object({ email: emailField() }),
		onSubmit: ({ email }) => resend.mutate({ email: email.trim() }),
	});

	const next = isAuthenticated
		? { to: ROUTES.HOME, label: 'Continue to PolyGrid' }
		: { to: ROUTES.LOGIN, label: 'Sign in' };

	if (isPending) {
		return <AppLoader fullPage showLabel label="Verifying your email" />;
	}

	if (!isError) {
		const already = /already/i.test(data?.message || '');
		return (
			<AuthNotice>
				<span className="sc_icon" aria-hidden="true">
					<LuCircleCheck />
				</span>
				<AuthHeader
					eyebrow="Email verification"
					title={already ? 'Already verified' : 'Email verified'}
					subtitle={
						already
							? 'This email was verified before — nothing more to do.'
							: 'Thanks — your email is confirmed. You’re all set.'
					}
				/>
				<AppButton to={next.to} icon={<LuArrowRight />} className="w-full">
					{next.label}
				</AppButton>
			</AuthNotice>
		);
	}

	// backend: "Verification token has expired" vs "Invalid or expired
	// verification token" (bad / superseded link)
	const expired = /has expired/i.test(error?.response?.data?.message || '');

	if (resend.isSuccess) {
		return (
			<>
				<AuthHeader
					eyebrow="Email verification"
					title="Check your email"
					subtitle={
						<>
							If <strong>{form.values.email}</strong> has an account that isn’t
							verified yet, a new link is on its way. It’s valid for 24 hours.
						</>
					}
				/>
				<AuthSwitch>
					<Link to={ROUTES.HOME}>Back to PolyGrid</Link>
				</AuthSwitch>
			</>
		);
	}

	return (
		<>
			<span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--pg-status-errorSoft) text-2xl text-(--pg-status-error)">
				<LuMailX aria-hidden="true" />
			</span>
			<AuthHeader
				eyebrow="Email verification"
				title={expired ? 'Link expired' : 'Link not valid'}
				subtitle="Verification links last 24 hours and only the newest one works. Enter your email and we’ll send a fresh link."
			/>
			<form
				noValidate
				onSubmit={form.handleSubmit}
				className="flex flex-col gap-5"
			>
				<CustomInput
					label="Email"
					name="email"
					type="email"
					autoComplete="email"
					required
					value={form.values.email}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={(form.touched.email && form.errors.email) || false}
					errormessage={form.errors.email}
				/>
				<AppButton
					type="submit"
					icon={<LuSend />}
					disabled={resend.isPending}
					className="w-full"
				>
					{resend.isPending ? 'Sending…' : 'Send a new link'}
				</AppButton>
			</form>
		</>
	);
}

export default VerifyEmail;
