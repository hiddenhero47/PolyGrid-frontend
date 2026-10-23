import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AdminServices from '../../../features/services/custom-hooks/admin';
import { toast } from '../../../layouts/toast/toast-handler';
import Modal from '../../../components/modal/index_modal';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomPassword,
	CustomRadioGroup,
} from '../../../components/form-components';
import {
	emailField,
	newPasswordField,
} from '../../../features/validations/common';
import { SYSTEM_ROLE } from '../../../utilities/app-const';

const ROLE_OPTIONS = [
	{
		value: SYSTEM_ROLE.ADMIN,
		label: 'Admin',
		description:
			'Reviews and decides: verifications, plans, subscriptions, disputes.',
	},
	{
		value: SYSTEM_ROLE.CUSTOMER_CARE,
		label: 'Customer care',
		description: 'Read-only: sees the queues and profiles, changes nothing.',
	},
];

// New staff account (POST /api/users/admin-create, then a role change for
// customer care). They sign in with this email and password; the
// password should be changed on first sign-in from Settings.
function AddStaffModal({ refName }) {
	const create = AdminServices.createStaff();
	const form = useFormik({
		initialValues: {
			fullName: '',
			email: '',
			password: '',
			role: SYSTEM_ROLE.ADMIN,
		},
		validationSchema: yup.object({
			fullName: yup.string().trim().required('Their full name'),
			email: emailField(),
			password: newPasswordField(),
		}),
		onSubmit: (values, { resetForm }) =>
			create.mutate(
				{
					fullName: values.fullName.trim(),
					email: values.email.trim().toLowerCase(),
					password: values.password,
					role: values.role,
				},
				{
					onSuccess: () => {
						resetForm();
						refName.current.close();
						toast.success(`${values.fullName.trim()} can now sign in`, {
							title: 'Staff account created',
						});
					},
				}
			),
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	return (
		<Modal.Center
			refName={refName}
			width="560px"
			queryWidth="100%"
			onClose={() => form.resetForm()}
		>
			<Modal.Card
				eyebrow="People"
				title="Add staff"
				subtitle="Share the email and temporary password with them privately; they should change it in Settings."
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton
							type="submit"
							form="add-staff-form"
							disabled={create.isPending}
						>
							{create.isPending ? 'Creating…' : 'Create account'}
						</AppButton>
					</>
				}
			>
				<form
					id="add-staff-form"
					noValidate
					onSubmit={form.handleSubmit}
					className="flex flex-col gap-5"
				>
					<CustomInput
						label="Full name"
						name="fullName"
						required
						value={form.values.fullName}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('fullName')}
						errormessage={form.errors.fullName}
					/>
					<CustomInput
						label="Email"
						name="email"
						type="email"
						required
						autoComplete="off"
						value={form.values.email}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('email')}
						errormessage={form.errors.email}
					/>
					<CustomPassword
						label="Temporary password"
						name="password"
						required
						autoComplete="new-password"
						value={form.values.password}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('password')}
						errormessage={form.errors.password}
					/>
					<CustomRadioGroup
						label="Role"
						name="role"
						variant="rows"
						options={ROLE_OPTIONS}
						value={form.values.role}
						onChange={(value) => form.setFieldValue('role', value)}
					/>
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

AddStaffModal.propTypes = {
	refName: PropTypes.object.isRequired,
};

export default AddStaffModal;
