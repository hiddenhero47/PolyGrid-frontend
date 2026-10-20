import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuKeyRound } from 'react-icons/lu';
import AccountServices from '../../../../features/services/custom-hooks/account';
import { toast } from '../../../../layouts/toast/toast-handler';
import { AppButton } from '../../../../components/button';
import { CustomPassword } from '../../../../components/form-components';
import {
	newPasswordField,
	confirmPasswordField,
} from '../../../../features/validations/common';
import { ROUTES } from '../../../../utilities/app-routes';
import SettingsCard from './settings-card';

// PUT /api/users/profile { oldPassword, password }. Changing it signs
// out every device, this one included (see AccountServices).
function PasswordSection() {
	const navigate = useNavigate();
	const change = AccountServices.changePassword();
	const form = useFormik({
		initialValues: { oldPassword: '', password: '', confirmPassword: '' },
		validationSchema: yup.object({
			oldPassword: yup.string().required('Enter your current password'),
			password: newPasswordField().notOneOf(
				[yup.ref('oldPassword')],
				'Choose a different password'
			),
			confirmPassword: confirmPasswordField(),
		}),
		onSubmit: ({ oldPassword, password }, { resetForm }) =>
			change.mutate(
				{ oldPassword, password },
				{
					onSuccess: () => {
						resetForm();
						toast.success('Sign in with your new password.', {
							title: 'Password changed',
						});
						navigate(ROUTES.LOGIN, { replace: true });
					},
				}
			),
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	return (
		<SettingsCard
			id="password-settings"
			title="Password"
			description="Use at least 8 characters. Changing it signs you out everywhere, including here, so you’ll sign in again with the new one."
		>
			<form
				noValidate
				onSubmit={form.handleSubmit}
				className="flex flex-col gap-5"
			>
				<CustomPassword
					label="Current password"
					name="oldPassword"
					autoComplete="current-password"
					value={form.values.oldPassword}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('oldPassword')}
					errormessage={form.errors.oldPassword}
				/>
				<div className="grid gap-5 sm:grid-cols-2">
					<CustomPassword
						label="New password"
						name="password"
						autoComplete="new-password"
						value={form.values.password}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('password')}
						errormessage={form.errors.password}
					/>
					<CustomPassword
						label="Confirm new password"
						name="confirmPassword"
						autoComplete="new-password"
						value={form.values.confirmPassword}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('confirmPassword')}
						errormessage={form.errors.confirmPassword}
					/>
				</div>
				<div>
					<AppButton
						type="submit"
						icon={<LuKeyRound />}
						disabled={change.isPending}
					>
						{change.isPending ? 'Changing…' : 'Change password'}
					</AppButton>
				</div>
			</form>
		</SettingsCard>
	);
}

export default PasswordSection;
