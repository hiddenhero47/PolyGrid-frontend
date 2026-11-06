import React from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
	LuCloudOff,
	LuRotateCw,
	LuSave,
	LuTriangleAlert,
	LuX,
} from 'react-icons/lu';
import SystemSettingsServices from '../../features/services/custom-hooks/system-settings';
import ReferenceServices from '../../features/services/custom-hooks/reference';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import AppLoader from '../../components/loader';
import EmptyState from '../../components/empty-state';
import { AppButton } from '../../components/button';
import { CustomInput, CustomSelect } from '../../components/form-components';
import { Chip } from '../../pages/home/elements/index.style';
import { AdminSection } from '../elements/index.style';
import { SYSTEM_ROLE } from '../../utilities/app-const';
import { countryName } from '../../utilities/basic-functions';

const AMOUNTS = [
	{
		section: 'limits',
		name: 'maxTransactionAmount',
		label: 'Maximum per payment (USD)',
		hint: 'Anything above this is refused.',
	},
	{
		section: 'limits',
		name: 'maxOutstandingExposure',
		label: 'Maximum held at once (USD)',
		hint: 'Money in escrow across the platform. New payments are refused at this cap, and it frees up as jobs settle. Subscriptions don’t count.',
	},
	{
		section: 'fraud',
		name: 'fraudHoldThresholdAmount',
		label: 'Hold payments above (USD)',
		hint: 'The card is charged, but escrow, downloads and plans wait until the hold ends.',
	},
	{
		section: 'fraud',
		name: 'fraudHoldHours',
		label: 'Hold length (hours)',
	},
	{
		section: 'fraud',
		name: 'manualReviewThresholdAmount',
		label: 'Manual review above (USD)',
		hint: 'The buyer confirms their password or 2FA code, and an admin must release the hold.',
	},
];

const validation = yup.object(
	Object.fromEntries(
		AMOUNTS.map(({ name }) => [
			name,
			yup
				.number()
				.typeError('Enter a number')
				.min(0, 'Can’t be negative')
				.required('Required'),
		])
	)
);

// What's wrong with these values, in words. Payments stop dead when closed;
// a threshold at or above the per-payment maximum can never be reached.
const warningsFor = (values) => {
	const max = Number(values.maxTransactionAmount);
	const list = [];
	if (!values.supportedCountries.length || !max)
		list.push(
			'Payments are closed: nobody can pay until there’s a supported country and a maximum per payment.'
		);
	else {
		if (Number(values.fraudHoldThresholdAmount) >= max)
			list.push(
				'No payment will ever be held: the hold starts at or above the maximum per payment.'
			);
		if (Number(values.manualReviewThresholdAmount) >= max)
			list.push(
				'No payment will ever reach manual review: it starts at or above the maximum per payment.'
			);
	}
	return list;
};

// The limits on money moving through the platform (backend
// helpers/paymentGuardrails.ts). They start closed on a new database.
// Reviewers can read them; only the super admin changes them.
function SystemSettings() {
	const { user } = useSelector((state) => state.auth);
	const canEdit = user?.systemRole === SYSTEM_ROLE.SUPER_ADMIN;
	const settings = SystemSettingsServices.get();
	const update = SystemSettingsServices.update();
	const { data: countries = [] } = ReferenceServices.getCountries();

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			...Object.fromEntries(
				AMOUNTS.map(({ name }) => [name, settings.data?.[name] ?? ''])
			),
			supportedCountries: settings.data?.supportedCountries || [],
		},
		validationSchema: validation,
		onSubmit: (values) =>
			update.mutate(
				{
					...Object.fromEntries(
						AMOUNTS.map(({ name }) => [name, Number(values[name])])
					),
					supportedCountries: values.supportedCountries,
				},
				{ onSuccess: () => toast.success('Payment settings saved') }
			),
	});

	if (settings.isPending) return <AppLoader fullPage />;

	if (settings.isError)
		return (
			<EmptyState
				tone="error"
				icon={<LuCloudOff />}
				title="Couldn’t load the settings"
				actions={
					<AppButton icon={<LuRotateCw />} onClick={() => settings.refetch()}>
						Retry
					</AppButton>
				}
			/>
		);

	const chosen = form.values.supportedCountries;
	const setCountries = (next) => form.setFieldValue('supportedCountries', next);
	const warnings = warningsFor(form.values);

	const amountFields = (section) =>
		AMOUNTS.filter((a) => a.section === section).map(
			({ name, label, hint }) => (
				<CustomInput
					key={name}
					label={label}
					name={name}
					type="number"
					min="0"
					hint={hint}
					required
					disabled={!canEdit}
					value={form.values[name]}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={(form.touched[name] && form.errors[name]) || false}
					errormessage={form.errors[name]}
				/>
			)
		);

	return (
		<>
			<PageHeader
				eyebrow="Billing"
				title="Payment settings"
				subtitle="How much money PolyGrid will take, from where, and when it holds a payment back. Changes apply to the next payment."
			/>

			<form noValidate onSubmit={form.handleSubmit} className="max-w-200">
				{warnings.length > 0 && (
					<ul className="mb-8 flex flex-col gap-2 rounded-xl bg-(--pg-status-warningSoft) p-4 text-sm text-(--pg-text-primary)">
						{warnings.map((text) => (
							<li key={text} className="flex items-start gap-2">
								<LuTriangleAlert
									aria-hidden="true"
									className="mt-0.5 shrink-0 text-(--pg-status-warning)"
								/>
								{text}
							</li>
						))}
					</ul>
				)}

				<AdminSection>
					<div className="sc_sectionHead">
						<h3 className="sc_sectionTitle">Limits</h3>
					</div>
					<div className="grid items-start gap-5 sm:grid-cols-2">
						{amountFields('limits')}
					</div>
				</AdminSection>

				<AdminSection>
					<div className="sc_sectionHead">
						<h3 className="sc_sectionTitle">Fraud protection</h3>
					</div>
					<div className="grid items-start gap-5 sm:grid-cols-2">
						{amountFields('fraud')}
					</div>
				</AdminSection>

				<AdminSection>
					<div className="sc_sectionHead">
						<h3 className="sc_sectionTitle">Supported countries</h3>
					</div>
					<div className="flex flex-col gap-4">
						{canEdit && (
							<CustomSelect
								id="settings-country"
								label="Add a country"
								placeholder="Choose a country"
								hint="A buyer’s own country must be on this list before they can pay."
								options={countries
									.filter((c) => !chosen.includes(c.isoCode))
									.map((c) => ({ value: c.isoCode, label: c.name }))}
								value=""
								onChange={(code) => code && setCountries([...chosen, code])}
							/>
						)}
						{chosen.length ? (
							<div className="flex flex-wrap gap-2">
								{chosen.map((code) => (
									<Chip key={code} $accent>
										{countryName(code)}
										{canEdit && (
											<button
												type="button"
												aria-label={`Remove ${countryName(code)}`}
												onClick={() =>
													setCountries(chosen.filter((c) => c !== code))
												}
											>
												<LuX aria-hidden="true" />
											</button>
										)}
									</Chip>
								))}
							</div>
						) : (
							<p className="text-sm text-(--pg-text-secondary)">
								No countries yet.
							</p>
						)}
					</div>
				</AdminSection>

				{canEdit && (
					<div className="mt-8">
						<AppButton
							type="submit"
							icon={<LuSave />}
							disabled={update.isPending || !form.dirty}
						>
							{update.isPending ? 'Saving…' : 'Save settings'}
						</AppButton>
					</div>
				)}
			</form>
		</>
	);
}

export default SystemSettings;
