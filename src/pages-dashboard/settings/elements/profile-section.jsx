import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuSave, LuCamera, LuLock, LuLockOpen } from 'react-icons/lu';
import AccountServices from '../../../features/services/custom-hooks/account';
import ReferenceServices from '../../../features/services/custom-hooks/reference';
import PayoutKycServices from '../../../features/services/custom-hooks/payout-kyc';
import { setUser } from '../../../store/slice/auth';
import { toast } from '../../../layouts/toast/toast-handler';
import ConfirmModal from '../../../components/modal/confirm-modal';
import ConfirmIdentityModal from '../../../components/modal/confirm-identity-modal';
import ProfileAvatar from '../../../components/profile-avatar';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomPhone,
	CustomSelect,
} from '../../../components/form-components';
import { phoneField } from '../../../features/validations/common';
import { AVATAR_ACCEPT, PAYOUT_KYC_STATUS } from '../../../utilities/app-const';
import { countryName, displayName } from '../../../utilities/basic-functions';
import SettingsCard from './settings-card';

const MAX_AVATAR = 10 * 1024 * 1024;
// What the backend files as the legal name when someone signs up without one.
const PLACEHOLDER = { firstName: 'John', lastName: 'Doe' };

// Optional (signing up without a name is allowed), but never half a name.
const nameField = (label, other) =>
	yup
		.string()
		.trim()
		.max(50, 'That’s too long')
		.when(other, {
			is: (value) => Boolean(value?.trim()),
			then: (schema) => schema.required(`Your ${label} too`),
		});

// Display name, legal name, phone, country and the account photo (the photo
// every business profile falls back to). PUT /api/users/profile.
// The legal name (first + last) and country are who PolyGrid pays or
// refunds: changing them asks for the password / 2FA code, and once payout
// identity is verified they're locked — "Change name or country" gives the
// verification up (DELETE /me/payout-kyc), which also removes the saved
// payout account.
function ProfileSection() {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.auth);
	const update = AccountServices.updateProfile();
	const { data: countries = [] } = ReferenceServices.getCountries();
	const kyc = PayoutKycServices.getMine({ enabled: Boolean(user) });
	const revoke = PayoutKycServices.revoke();
	const confirmRef = useRef(null);
	const idRef = useRef(null);
	const [avatar, setAvatar] = useState(null);
	const preview = useMemo(
		() => (avatar ? URL.createObjectURL(avatar) : null),
		[avatar]
	);

	const locked = kyc.data?.record?.status === PAYOUT_KYC_STATUS.VERIFIED;
	const current = {
		firstName: user?.fullName?.firstName || '',
		lastName: user?.fullName?.lastName || '',
		country: user?.country || '',
	};
	const isPlaceholder =
		current.firstName === PLACEHOLDER.firstName &&
		current.lastName === PLACEHOLDER.lastName;

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			userName: user?.userName || '',
			// the backend's stand-in name isn't worth editing around
			firstName: isPlaceholder ? '' : current.firstName,
			lastName: isPlaceholder ? '' : current.lastName,
			phoneNumber: user?.phoneNumber?.number
				? { number: user.phoneNumber.number, country: user.phoneNumber.country }
				: { number: '', country: '' },
			country: current.country,
		},
		// shape(…, excludes): first and last name each depend on the other
		validationSchema: yup.object().shape(
			{
				userName: yup
					.string()
					.trim()
					.min(2, 'Too short')
					.max(60, 'That’s too long')
					.required('The name people see'),
				firstName: nameField('first name', 'lastName'),
				lastName: nameField('last name', 'firstName'),
				phoneNumber: phoneField(),
			},
			[['firstName', 'lastName']]
		),
		onSubmit: async (values) => {
			const fields = { userName: values.userName.trim() };
			if (values.phoneNumber?.number) fields.phoneNumber = values.phoneNumber;
			const identityFields = {
				firstName: values.firstName.trim(),
				lastName: values.lastName.trim(),
				...(values.country && { country: values.country }),
			};
			// an empty name means "leave it as it is"
			const changed = Object.entries(identityFields).filter(
				([key, value]) => value && value !== current[key]
			);
			if (changed.length && !locked) {
				Object.assign(fields, Object.fromEntries(changed));
				const identity = await idRef.current.ask({
					action: 'change your legal name or country',
				});
				if (!identity) return;
				Object.assign(fields, identity);
			}
			const hadAccount = Boolean(user?.payoutAccount);
			update.mutate(
				{ fields, avatar },
				{
					onSuccess: (res) => {
						setAvatar(null);
						if (res.avatarWarnings?.length)
							toast.warning(res.avatarWarnings.join(' · '));
						else if (hadAccount && res.user && !res.user.payoutAccount)
							toast.warning(
								'Your payout account was removed because it no longer matches your name or country. Add it again under Payout account.',
								{ title: 'Profile saved' }
							);
						else toast.success('Profile saved');
					},
					onError: (error) => {
						if (error.silentCode === 'PAYOUT_KYC_VERIFIED_LOCK')
							toast.warning(
								'Your name and country are locked while your payout identity is verified. Use “Change name or country” first.',
								{ title: 'Locked' }
							);
					},
				}
			);
		},
	});

	const unlock = async () => {
		const ok = await confirmRef.current.ask({
			title: 'Change your name or country?',
			text: 'Your payout identity is verified under your current name and country. Changing them removes that verification and deletes your saved payout account. You’ll verify again, and add your bank account again, before any refund or payout can reach you — and before you can start or accept a job.',
			confirmLabel: 'Remove verification',
		});
		if (!ok) return;
		const identity = await idRef.current.ask({
			action: 'remove your payout verification',
		});
		if (!identity) return;
		revoke.mutate(identity, {
			onSuccess: () => {
				dispatch(setUser({ ...user, payoutAccount: null }));
				toast.success(
					'You can change your name and country now. Verify your identity again afterwards.',
					{ title: 'Verification removed' }
				);
			},
		});
	};

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
	const lockedHint = locked
		? 'Locked while your identity is verified.'
		: undefined;

	return (
		<SettingsCard
			id="profile-settings"
			title="Profile"
			description="How people see you on PolyGrid, and the legal name we pay or refund you under. Business profiles use this photo until they get their own."
		>
			<form
				noValidate
				onSubmit={form.handleSubmit}
				className="flex flex-col gap-5"
			>
				<div className="flex items-center gap-4">
					<ProfileAvatar
						avatar={preview ? { url: preview } : user?.avatar}
						name={displayName(user)}
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
					label="Display name"
					name="userName"
					required
					autoComplete="nickname"
					hint="What other people see on PolyGrid: on jobs, messages and reviews."
					value={form.values.userName}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('userName')}
					errormessage={form.errors.userName}
				/>

				<fieldset className="flex flex-col gap-4 rounded-2xl border border-(--pg-card-border) p-4 sm:p-5">
					<legend className="px-1 text-sm font-semibold text-(--pg-text-primary)">
						Legal name and country
					</legend>
					<p className="text-sm text-(--pg-text-secondary)">
						As on your ID. Your identity check, refunds and payouts use this
						name, and your bank account must be in it. Only you and PolyGrid’s
						team see it.
					</p>
					{isPlaceholder && !locked && (
						<p
							role="status"
							className="rounded-xl bg-(--pg-status-warningSoft) px-3 py-2.5 text-sm text-(--pg-text-primary)"
						>
							Add your real name before you verify your identity.
						</p>
					)}
					<div className="grid items-start gap-4 sm:grid-cols-2">
						<CustomInput
							label="First name"
							name="firstName"
							autoComplete="given-name"
							disabled={locked}
							hint={lockedHint}
							value={form.values.firstName}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('firstName')}
							errormessage={form.errors.firstName}
						/>
						<CustomInput
							label="Last name"
							name="lastName"
							autoComplete="family-name"
							disabled={locked}
							hint={lockedHint}
							value={form.values.lastName}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('lastName')}
							errormessage={form.errors.lastName}
						/>
					</div>
					<CustomSelect
						id="settings-country"
						label="Country"
						placeholder="Choose your country"
						hint={
							locked
								? lockedHint
								: 'Needed before you can pay, and it decides how we check your identity.'
						}
						disabled={locked}
						options={countries.map((c) => ({
							value: c.isoCode,
							label: c.name,
						}))}
						value={form.values.country}
						onChange={(code) => form.setFieldValue('country', code)}
					/>
					{locked && (
						<div className="flex flex-wrap items-center gap-3">
							<span className="inline-flex items-center gap-2 text-sm text-(--pg-text-secondary)">
								<LuLock aria-hidden="true" />
								Verified as {current.firstName} {current.lastName}
								{current.country && `, ${countryName(current.country)}`}
							</span>
							<AppButton
								size="sm"
								variant="secondary"
								icon={<LuLockOpen />}
								onClick={unlock}
								disabled={revoke.isPending}
							>
								{revoke.isPending ? 'Removing…' : 'Change name or country'}
							</AppButton>
						</div>
					)}
				</fieldset>

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
			<ConfirmModal refName={confirmRef} />
			<ConfirmIdentityModal refName={idRef} />
		</SettingsCard>
	);
}

export default ProfileSection;
