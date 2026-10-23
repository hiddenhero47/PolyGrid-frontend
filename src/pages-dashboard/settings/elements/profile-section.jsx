import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuSave, LuCamera } from 'react-icons/lu';
import AccountServices from '../../../features/services/custom-hooks/account';
import { toast } from '../../../layouts/toast/toast-handler';
import ProfileAvatar from '../../../components/profile-avatar';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomPhone,
} from '../../../components/form-components';
import { phoneField } from '../../../features/validations/common';
import { AVATAR_ACCEPT } from '../../../utilities/app-const';
import SettingsCard from './settings-card';

const MAX_AVATAR = 10 * 1024 * 1024;

// Name, phone and the account photo — the photo every business profile
// falls back to until it gets its own. PUT /api/users/profile.
function ProfileSection() {
	const { user } = useSelector((state) => state.auth);
	const update = AccountServices.updateProfile();
	const [avatar, setAvatar] = useState(null);
	const preview = useMemo(
		() => (avatar ? URL.createObjectURL(avatar) : null),
		[avatar]
	);

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			fullName: user?.fullName || '',
			phoneNumber: user?.phoneNumber?.number
				? { number: user.phoneNumber.number, country: user.phoneNumber.country }
				: { number: '', country: '' },
		},
		validationSchema: yup.object({
			fullName: yup
				.string()
				.trim()
				.min(2, 'Too short')
				.required('Your name is required'),
			phoneNumber: phoneField(),
		}),
		onSubmit: (values) => {
			const fields = { fullName: values.fullName.trim() };
			if (values.phoneNumber?.number) fields.phoneNumber = values.phoneNumber;
			update.mutate(
				{ fields, avatar },
				{
					onSuccess: (res) => {
						setAvatar(null);
						if (res.avatarWarnings?.length)
							toast.warning(res.avatarWarnings.join(' · '));
						else toast.success('Profile saved');
					},
				}
			);
		},
	});

	const pick = (e) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		if (!AVATAR_ACCEPT.split(',').includes(file.type))
			return toast.error('Use a JPG, PNG, WebP or AVIF image');
		if (file.size > MAX_AVATAR) return toast.error('That image is over 10 MB');
		setAvatar(file);
	};

	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	return (
		<SettingsCard
			id="profile-settings"
			title="Profile"
			description="Your name and photo across PolyGrid. Business profiles use this photo until they get their own."
		>
			<form
				noValidate
				onSubmit={form.handleSubmit}
				className="flex flex-col gap-5"
			>
				<div className="flex items-center gap-4">
					<ProfileAvatar
						avatar={preview ? { url: preview } : user?.avatar}
						name={user?.fullName}
						size={72}
					/>
					<label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--pg-border-default) px-3.5 py-2 text-sm font-semibold text-(--pg-text-primary) hover:bg-(--pg-state-hover) focus-within:outline-2 focus-within:outline-(--pg-border-focus)">
						<LuCamera aria-hidden="true" />{' '}
						{avatar ? 'Choose another' : 'Change photo'}
						<input
							type="file"
							accept={AVATAR_ACCEPT}
							onChange={pick}
							className="sr-only"
						/>
					</label>
					{avatar && (
						<span className="text-sm text-(--pg-text-secondary)">
							Saved when you click Save
						</span>
					)}
				</div>
				<CustomInput
					label="Full name"
					name="fullName"
					required
					autoComplete="name"
					value={form.values.fullName}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('fullName')}
					errormessage={form.errors.fullName}
				/>
				<CustomInput
					label="Email"
					name="email"
					value={user?.email || ''}
					disabled
					hint="Your sign-in email can’t be changed here."
				/>
				<CustomPhone
					label="Phone"
					name="phoneNumber"
					value={form.values.phoneNumber}
					setFieldValue={form.setFieldValue}
					onBlur={form.handleBlur}
					isError={err('phoneNumber')}
					errormessage={form.errors.phoneNumber}
				/>
				<div>
					<AppButton
						type="submit"
						icon={<LuSave />}
						disabled={update.isPending || (!form.dirty && !avatar)}
					>
						{update.isPending ? 'Saving…' : 'Save'}
					</AppButton>
				</div>
			</form>
		</SettingsCard>
	);
}

export default ProfileSection;
