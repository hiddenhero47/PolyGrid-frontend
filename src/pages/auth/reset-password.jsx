import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { LuKeyRound, LuCircleCheck, LuArrowRight } from 'react-icons/lu';
import { AppButton } from '../../components/button';
import { CustomPassword } from '../../components/form-components';
import AuthServices from '../../features/services/custom-hooks/auth';
import { resetPasswordValidation } from '../../features/validations/auth-validation';
import { ROUTES } from '../../utilities/app-routes';
import AuthHeader from './elements/auth-header';
import { AuthSwitch, AuthNotice } from './elements/index.style';

// frontend-plan §A.4 — the emailed link is /reset-password/:token
// (userController requestReset builds it from FRONTEND_URL), and the form
// sends POST /api/users/reset-password { token, password }.
function ResetPassword() {
	const { token } = useParams();
	const {
		mutate: resetPassword,
		isPending,
		isSuccess,
	} = AuthServices.resetPassword();

	const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
		useFormik({
			initialValues: { password: '', confirmPassword: '' },
			validationSchema: resetPasswordValidation,
			onSubmit: ({ password }) => resetPassword({ token, password }),
		});

	const err = (field) => (touched[field] && errors[field]) || false;

	if (!token) {
		return (
			<>
				<AuthHeader
					title="Link missing"
					subtitle="This page needs the link from your reset email. Request a new one below."
				/>
				<AppButton to={ROUTES.FORGOT_PASSWORD} className="w-full">
					Request a new link
				</AppButton>
			</>
		);
	}

	if (isSuccess) {
		return (
			<AuthNotice>
				<span className="sc_icon" aria-hidden="true">
					<LuCircleCheck />
				</span>
				<AuthHeader
					title="Password updated"
					subtitle="You can sign in with your new password now."
				/>
				<AppButton to={ROUTES.LOGIN} icon={<LuArrowRight />} className="w-full">
					Sign in
				</AppButton>
			</AuthNotice>
		);
	}

	return (
		<>
			<AuthHeader
				eyebrow="Password reset"
				title="Set a new password"
				subtitle="Choose something you haven't used here before."
			/>
			<form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
				<CustomPassword
					label="New password"
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
					label="Confirm new password"
					name="confirmPassword"
					autoComplete="new-password"
					required
					value={values.confirmPassword}
					onChange={handleChange}
					onBlur={handleBlur}
					isError={err('confirmPassword')}
					errormessage={errors.confirmPassword}
				/>
				<AppButton
					type="submit"
					icon={<LuKeyRound />}
					disabled={isPending}
					className="mt-2 w-full"
				>
					{isPending ? 'Saving…' : 'Save new password'}
				</AppButton>
			</form>
			<AuthSwitch>
				Link expired? <Link to={ROUTES.FORGOT_PASSWORD}>Request a new one</Link>
			</AuthSwitch>
		</>
	);
}

export default ResetPassword;
