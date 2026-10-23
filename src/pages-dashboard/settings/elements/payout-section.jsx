import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LuLandmark, LuPencil } from 'react-icons/lu';
import AccountServices from '../../../features/services/custom-hooks/account';
import ReferenceServices from '../../../features/services/custom-hooks/reference';
import { toast } from '../../../layouts/toast/toast-handler';
import ConfirmIdentityModal from '../../../components/modal/confirm-identity-modal';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomSelect,
} from '../../../components/form-components';
import { countryName } from '../../../utilities/basic-functions';
import SettingsCard from './settings-card';

const mask = (number = '') =>
	number.length > 4 ? `•••• ${number.slice(-4)}` : number;

// Where payouts for completed jobs and sales are sent — needed before a
// payout request can be approved. Behind the confirm-identity check.
// PUT /api/users/payout-account.
function PayoutSection() {
	const { user } = useSelector((state) => state.auth);
	const account = user?.payoutAccount;
	const idRef = useRef(null);
	const [editing, setEditing] = useState(!account);
	const save = AccountServices.updatePayout();
	const { data: countries = [] } = ReferenceServices.getCountries();

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			accountName: account?.accountName || user?.fullName || '',
			accountNumber: account?.accountNumber || '',
			bankName: account?.bankName || '',
			bankCode: account?.bankCode || '',
			country: account?.country || '',
		},
		validationSchema: yup.object({
			accountName: yup.string().trim().required('Name on the account'),
			accountNumber: yup
				.string()
				.trim()
				.matches(/^[A-Za-z0-9 -]{4,34}$/, 'Check the account number')
				.required('Account number'),
			bankName: yup.string().trim().required('Bank name'),
			bankCode: yup.string().trim().max(20),
			country: yup.string().required('Bank country'),
		}),
		onSubmit: async (values) => {
			const identity = await idRef.current.ask({
				action: 'save your payout account',
			});
			if (!identity) return;
			const body = {
				accountName: values.accountName.trim(),
				accountNumber: values.accountNumber.trim(),
				bankName: values.bankName.trim(),
				country: values.country,
				...(values.bankCode.trim() && { bankCode: values.bankCode.trim() }),
				...identity,
			};
			save.mutate(body, {
				onSuccess: () => {
					setEditing(false);
					toast.success('Payout account saved');
				},
			});
		},
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	return (
		<SettingsCard
			id="payout-settings"
			title="Payout account"
			description="Where we send your earnings from completed jobs and sales. Changing it asks you to confirm it’s you."
		>
			{account && !editing ? (
				<div className="flex flex-wrap items-center gap-4 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-5">
					<span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-(--pg-icon-background) text-lg text-(--pg-icon-color)">
						<LuLandmark aria-hidden="true" />
					</span>
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-(--pg-text-primary)">
							{account.bankName} · {mask(account.accountNumber)}
						</p>
						<p className="text-sm text-(--pg-text-secondary)">
							{account.accountName} · {countryName(account.country)}
						</p>
					</div>
					<AppButton
						size="sm"
						variant="secondary"
						icon={<LuPencil />}
						onClick={() => setEditing(true)}
					>
						Change
					</AppButton>
				</div>
			) : (
				<form
					noValidate
					onSubmit={form.handleSubmit}
					className="grid gap-5 sm:grid-cols-2"
				>
					<div className="sm:col-span-2">
						<CustomInput
							label="Name on the account"
							name="accountName"
							required
							value={form.values.accountName}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('accountName')}
							errormessage={form.errors.accountName}
						/>
					</div>
					<CustomInput
						label="Bank"
						name="bankName"
						required
						value={form.values.bankName}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('bankName')}
						errormessage={form.errors.bankName}
					/>
					<CustomInput
						label="Account number"
						name="accountNumber"
						required
						inputMode="numeric"
						autoComplete="off"
						value={form.values.accountNumber}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('accountNumber')}
						errormessage={form.errors.accountNumber}
					/>
					<CustomSelect
						label="Bank country"
						name="country"
						required
						placeholder="Choose a country"
						options={countries.map((c) => ({
							value: c.isoCode,
							label: c.name,
						}))}
						value={form.values.country}
						handleChange={(name) => (value) => form.setFieldValue(name, value)}
						onBlur={form.handleBlur}
						isError={err('country')}
						errormessage={form.errors.country}
					/>
					<CustomInput
						label="Bank / sort code"
						name="bankCode"
						hint="If your bank uses one"
						value={form.values.bankCode}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('bankCode')}
						errormessage={form.errors.bankCode}
					/>
					<div className="flex flex-wrap gap-3 sm:col-span-2">
						<AppButton
							type="submit"
							icon={<LuLandmark />}
							disabled={save.isPending}
						>
							{save.isPending ? 'Saving…' : 'Save payout account'}
						</AppButton>
						{account && (
							<AppButton
								variant="secondary"
								onClick={() => {
									form.resetForm();
									setEditing(false);
								}}
							>
								Cancel
							</AppButton>
						)}
					</div>
				</form>
			)}
			<ConfirmIdentityModal refName={idRef} />
		</SettingsCard>
	);
}

export default PayoutSection;
