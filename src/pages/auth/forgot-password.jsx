import React from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { LuSend, LuMailCheck } from 'react-icons/lu';
import { AppButton } from '../../components/button';
import { CustomInput } from '../../components/form-components';
import AuthServices from '../../features/services/custom-hooks/auth';
import { requestResetValidation } from '../../features/validations/auth-validation';
import { ROUTES } from '../../utilities/app-routes';
import AuthHeader from './elements/auth-header';
import { AuthSwitch, AuthNotice } from './elements/index.style';

// frontend-plan §A.4 — POST /api/users/request-reset. The backend answers
// the same way whether or not the email has an account, so this page does
// too (never reveals who's registered).
function ForgotPassword() {
	const {
		mutate: requestReset,
		isPending,
		isSuccess,
		reset,
	} = AuthServices.requestReset();

	const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
		useFormik({
			initialValues: { email: '' },
			validationSchema: requestResetValidation,
			onSubmit: ({ email }) => requestReset({ email: email.trim() }),
		});

	if (isSuccess) {
		return (
			<AuthNotice>
				<span className="sc_icon" aria-hidden="true">
					<LuMailCheck />
				</span>
				<AuthHeader
					title="Check your email"
					subtitle={
						<>
							If an account exists for <strong>{values.email}</strong>,
							we&apos;ve sent a link to reset your password. It expires soon, so
							use it shortly.
						</>
					}
				/>
				<AuthSwitch className="self-stretch">
					Didn&apos;t get it?{' '}
					<button type="button" onClick={reset}>
						Try again
					</button>{' '}
					· <Link to={ROUTES.LOGIN}>Back to sign in</Link>
				</AuthSwitch>
			</AuthNotice>
		);
	}

	return (
		<>
			<AuthHeader
				eyebrow="Password reset"
				title="Forgot your password?"
				subtitle="Enter the email you signed up with and we'll send you a link to set a new one."
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
					isError={(touched.email && errors.email) || false}
					errormessage={errors.email}
				/>
				<AppButton
					type="submit"
					icon={<LuSend />}
					disabled={isPending}
					className="mt-2 w-full"
				>
					{isPending ? 'Sending…' : 'Send reset link'}
				</AppButton>
			</form>
			<AuthSwitch>
				Remembered it? <Link to={ROUTES.LOGIN}>Back to sign in</Link>
			</AuthSwitch>
		</>
	);
}

export default ForgotPassword;
