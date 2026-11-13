import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuFingerprint, LuSend } from 'react-icons/lu';
import PayoutKycServices from '../../../features/services/custom-hooks/payout-kyc';
import { toast } from '../../../layouts/toast/toast-handler';
import ConfirmIdentityModal from '../../../components/modal/confirm-identity-modal';
import StatusBadge from '../../../components/status-badge';
import { AppButton } from '../../../components/button';
import { SkeletonBar } from '../../../components/table/index.style';
import {
	CustomFile,
	CustomInput,
	CustomRadioGroup,
} from '../../../components/form-components';
import {
	PAYOUT_KYC_BADGES,
	PAYOUT_KYC_ID_TYPES,
	PAYOUT_KYC_STATUS,
} from '../../../utilities/app-const';
import { formatDate, legalName } from '../../../utilities/basic-functions';
import SettingsCard from './settings-card';

const SECTION_ID = 'payout-kyc-settings';
const ACCEPT = '.jpg,.jpeg,.png,.webp';
const DOCUMENTS = [
	{ type: 'idFront', label: 'Government ID, front' },
	{ type: 'idBack', label: 'Government ID, back' },
	{ type: 'face', label: 'A clear photo of your face' },
];

// An admin's reason may or may not end in a full stop.
const sentence = (text) => (/[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

const schemaFor = (track) =>
	track === 'automated'
		? yup.object({
				idType: yup.string().oneOf(['bvn', 'nin']).required('Choose one'),
				idNumber: yup
					.string()
					.trim()
					.matches(/^\d{11}$/, 'It’s 11 digits')
					.required('Enter the number'),
			})
		: yup.object({
				files: yup.object(
					Object.fromEntries(
						DOCUMENTS.map(({ type }) => [
							type,
							yup.mixed().required('Add this photo'),
						])
					)
				),
			});

// The identity check PolyGrid needs before any refund or payout to you can
// be approved (the backend refuses without it). The backend picks the
// track from your country: a BVN / NIN number checked at once, or three
// photos an admin reviews. Behind the confirm-identity check.
function PayoutKycSection() {
	const { user } = useSelector((state) => state.auth);
	const { hash } = useLocation();
	const idRef = useRef(null);
	const mine = PayoutKycServices.getMine({ enabled: Boolean(user?.country) });
	const submit = PayoutKycServices.submit();
	const { record, track } = mine.data || {};
	const status = record?.status;

	const form = useFormik({
		initialValues: {
			idType: 'bvn',
			idNumber: '',
			files: { idFront: null, idBack: null, face: null },
		},
		validationSchema: schemaFor(track),
		onSubmit: async (values) => {
			const identity = await idRef.current.ask({
				action: 'verify your identity for payouts',
			});
			if (!identity) return;
			submit.mutate(
				{
					track,
					idType: values.idType,
					idNumber: values.idNumber.trim(),
					files: values.files,
					identity,
				},
				{
					onSuccess: (res) => {
						form.resetForm();
						if (res?.status === PAYOUT_KYC_STATUS.VERIFIED)
							toast.success('You’re verified for payouts');
						else if (res?.status === PAYOUT_KYC_STATUS.FAILED)
							toast.error(
								res.failureReason || 'That number couldn’t be verified',
								{ title: 'Not verified' }
							);
						else
							toast.success('Sent. We’ll let you know when it’s reviewed.');
					},
				}
			);
		},
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;
	const fileErr = (type) =>
		(form.touched.files?.[type] || form.submitCount > 0) &&
		form.errors.files?.[type];

	const name = legalName(user);
	// signing up without a name files it as "John Doe" — nothing to check
	const needsName = !name || name === 'John Doe';
	const showForm =
		user?.country &&
		!needsName &&
		mine.isSuccess &&
		(!record || status === PAYOUT_KYC_STATUS.FAILED);

	return (
		<SettingsCard
			id={SECTION_ID}
			title="Payout identity"
			description="Before we can send you a refund or a payout, we check that the money goes to the right person. You only do this once."
		>
			<div
				ref={(el) =>
					hash === `#${SECTION_ID}` &&
					el?.scrollIntoView({ block: 'center' })
				}
				className="flex flex-col items-start gap-4"
			>
				{!user?.country && (
					<p className="text-sm text-(--pg-text-secondary)">
						Set your country under Profile first. It decides how we check
						your identity.
					</p>
				)}
				{user?.country && needsName && !record && (
					<p className="text-sm text-(--pg-text-secondary)">
						Add your legal name under{' '}
						<a
							href="#profile-settings"
							className="font-semibold text-(--pg-text-link) hover:underline"
						>
							Profile
						</a>{' '}
						first, exactly as it is on your ID. That’s the name we check.
					</p>
				)}
				{showForm && (
					<p className="text-sm text-(--pg-text-secondary)">
						We check against your legal name, <strong>{name}</strong>. If
						that’s not exactly as on your ID, fix it under Profile first: it’s
						locked once you’re verified.
					</p>
				)}

				{user?.country && mine.isPending && (
					<div className="flex w-full max-w-sm flex-col gap-2">
						<SkeletonBar $width="30%" />
						<SkeletonBar $width="80%" />
					</div>
				)}

				{mine.isError && (
					<p role="alert" className="text-sm text-(--pg-text-secondary)">
						Couldn’t load your status.{' '}
						<button
							type="button"
							onClick={() => mine.refetch()}
							className="font-semibold text-(--pg-text-link) hover:underline"
						>
							Retry
						</button>
					</p>
				)}

				{record && (
					<>
						<StatusBadge
							label={PAYOUT_KYC_BADGES[status]?.label || status}
							tone={PAYOUT_KYC_BADGES[status]?.tone || 'neutral'}
						/>
						<p className="text-sm text-(--pg-text-secondary)">
							{status === PAYOUT_KYC_STATUS.VERIFIED &&
								`Verified ${formatDate(record.verifiedAt || record.updatedAt)}${
									record.idType
										? ` with your ${record.idType.toUpperCase()} ending ${record.last4}`
										: ' from your ID photos'
								}. Refunds and payouts to you can be approved.`}
							{status === PAYOUT_KYC_STATUS.PENDING &&
								'We’re checking your ID photos. You’ll get a notification when it’s done.'}
							{status === PAYOUT_KYC_STATUS.FAILED &&
								`${sentence(record.rejectionReason || record.failureReason || 'This check didn’t pass')} Try again below.`}
						</p>
					</>
				)}

				{showForm && (
					<form
						noValidate
						onSubmit={form.handleSubmit}
						className="flex w-full flex-col gap-5"
					>
						{track === 'automated' ? (
							<>
								<CustomRadioGroup
									label="Check with"
									name="idType"
									options={PAYOUT_KYC_ID_TYPES}
									value={form.values.idType}
									onChange={(v) => form.setFieldValue('idType', v)}
								/>
								<CustomInput
									label={`Your ${form.values.idType.toUpperCase()}`}
									name="idNumber"
									required
									inputMode="numeric"
									autoComplete="off"
									maxLength={11}
									hint={`11 digits. The name on it must match your legal name, ${name}.`}
									value={form.values.idNumber}
									onChange={form.handleChange}
									onBlur={form.handleBlur}
									isError={err('idNumber')}
									errormessage={form.errors.idNumber}
								/>
							</>
						) : (
							DOCUMENTS.map(({ type, label }) => (
								<CustomFile
									key={type}
									name={type}
									label={label}
									required
									accept={ACCEPT}
									acceptLabel="JPG, PNG, WEBP"
									hint="Only PolyGrid’s review team can see this photo."
									value={form.values.files[type]}
									onChange={(file) => {
										form.setFieldValue(`files.${type}`, file);
										form.setFieldTouched(`files.${type}`, true, false);
									}}
									isError={Boolean(fileErr(type))}
									errormessage={form.errors.files?.[type]}
								/>
							))
						)}
						<div>
							<AppButton
								type="submit"
								icon={track === 'automated' ? <LuFingerprint /> : <LuSend />}
								disabled={submit.isPending}
							>
								{submit.isPending
									? 'Checking…'
									: track === 'automated'
										? 'Verify now'
										: 'Send for review'}
							</AppButton>
						</div>
					</form>
				)}
			</div>
			<ConfirmIdentityModal refName={idRef} />
		</SettingsCard>
	);
}

export default PayoutKycSection;
