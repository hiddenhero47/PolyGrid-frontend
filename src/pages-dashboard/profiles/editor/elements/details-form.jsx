import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { LuSave } from 'react-icons/lu';
import ReferenceServices from '../../../../features/services/custom-hooks/reference';
import { AppButton } from '../../../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomSelect,
	CustomCheckboxGroup,
} from '../../../../components/form-components';
import ConfirmModal from '../../../../components/modal/confirm-modal';
import { profileDetailsSchema } from '../../../../features/validations/profile-validation';

// the long text field — `bio`, or a store's `description`
const bioKey = (config) => config.bioField || 'bio';

const fromProfile = (config, profile = {}) => ({
	[config.nameField]: profile[config.nameField] || '',
	country: profile.country || '',
	city: profile.city || '',
	[bioKey(config)]: profile[bioKey(config)] || '',
	...(config.years && { yearsOfExperience: profile.yearsOfExperience ?? '' }),
	...(config.disciplines && {
		[config.disciplines.field]: profile[config.disciplines.field] || [],
	}),
});

// Only what the form edits. On create, empty optional fields are left
// out; on edit they're sent as '' (clears them).
const toBody = (config, values, creating) => {
	const body = {
		[config.nameField]: values[config.nameField].trim(),
		country: values.country,
		city: values.city.trim(),
		[bioKey(config)]: values[bioKey(config)].trim(),
	};
	if (config.disciplines)
		body[config.disciplines.field] = values[config.disciplines.field];
	if (
		config.years &&
		values.yearsOfExperience !== '' &&
		values.yearsOfExperience != null
	) {
		body.yearsOfExperience = Number(values.yearsOfExperience);
	}
	if (creating) {
		if (!body.city) delete body.city;
		if (!body[bioKey(config)]) delete body[bioKey(config)];
	}
	return body;
};

// Name, what-I-do, location, experience and bio — the create form and the
// editor's Details tab for every business profile (POST / PATCH
// <base>/me). Which of those fields exist comes from the editor config.
function DetailsForm({
	config,
	profile,
	onSubmit,
	isPending,
	submitLabel = 'Save changes',
}) {
	const creating = !profile;
	const confirmRef = useRef(null);
	const { data: countries = [] } = ReferenceServices.getCountries();

	const form = useFormik({
		initialValues: fromProfile(config, profile),
		enableReinitialize: true,
		validationSchema: profileDetailsSchema(config),
		onSubmit: async (values) => {
			// some pillars (a store's categories) delete data when an option
			// is removed — say so before saving
			const warn = config.disciplines?.removalWarning;
			if (warn && !creating) {
				const field = config.disciplines.field;
				const removed = (profile[field] || []).filter(
					(value) => !values[field].includes(value)
				);
				if (removed.length) {
					const labels = removed.map(
						(value) =>
							config.disciplines.options.find((o) => o.value === value)
								?.label || value
					);
					if (!(await confirmRef.current.ask(warn(labels)))) return;
				}
			}
			onSubmit(toBody(config, values, creating));
		},
	});
	const { data: cities = [] } = ReferenceServices.getCities(
		form.values.country
	);
	const err = (name) => (form.touched[name] && form.errors[name]) || false;
	const listId = `${config.nameField}-city-suggestions`;
	const disciplines = config.disciplines;
	const bio = bioKey(config);

	return (
		<form
			noValidate
			onSubmit={form.handleSubmit}
			className="grid gap-5 lg:grid-cols-2"
		>
			<div className="lg:col-span-2">
				<CustomInput
					label={config.nameLabel}
					name={config.nameField}
					required
					placeholder={config.namePlaceholder}
					hint={config.nameHint}
					value={form.values[config.nameField]}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err(config.nameField)}
					errormessage={form.errors[config.nameField]}
				/>
			</div>

			{disciplines && (
				<div className="lg:col-span-2">
					<CustomCheckboxGroup
						label={disciplines.label}
						name={disciplines.field}
						required
						options={disciplines.options}
						columns={disciplines.columns}
						value={form.values[disciplines.field]}
						setFieldValue={(name, value) => {
							form.setFieldValue(name, value);
							form.setFieldTouched(name, true, false);
						}}
						isError={err(disciplines.field)}
						errormessage={form.errors[disciplines.field]}
					/>
				</div>
			)}

			<CustomSelect
				label="Country"
				name="country"
				required
				placeholder={
					countries.length ? 'Choose a country' : 'Loading countries…'
				}
				options={countries.map((c) => ({ value: c.isoCode, label: c.name }))}
				value={form.values.country}
				handleChange={(name) => (value) => {
					form.setFieldValue(name, value);
					if (value !== form.values.country) form.setFieldValue('city', '');
				}}
				onBlur={form.handleBlur}
				isError={err('country')}
				errormessage={form.errors.country}
			/>
			<div>
				<CustomInput
					label="City"
					name="city"
					placeholder={
						form.values.country ? 'Start typing…' : 'Choose a country first'
					}
					disabled={!form.values.country}
					list={listId}
					autoComplete="off"
					value={form.values.city}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('city')}
					errormessage={form.errors.city}
				/>
				{/* native suggestions, no custom combobox needed */}
				<datalist id={listId}>
					{cities.map((city) => (
						<option key={`${city.name}-${city.stateCode}`} value={city.name} />
					))}
				</datalist>
			</div>

			{config.years && (
				<>
					<CustomInput
						label="Years of experience"
						name="yearsOfExperience"
						type="number"
						inputMode="numeric"
						min="0"
						value={form.values.yearsOfExperience}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('yearsOfExperience')}
						errormessage={form.errors.yearsOfExperience}
					/>
					<div className="hidden lg:block" />
				</>
			)}

			<div className="lg:col-span-2">
				<CustomTextarea
					label="About"
					name={bio}
					placeholder={config.bioPlaceholder}
					minHeight="150px"
					maxLength={2000}
					value={form.values[bio]}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err(bio)}
					errormessage={form.errors[bio]}
				/>
			</div>

			<div className="flex flex-wrap items-center gap-3 lg:col-span-2">
				<AppButton
					type="submit"
					icon={<LuSave />}
					disabled={isPending || (!creating && !form.dirty)}
				>
					{isPending ? 'Saving…' : submitLabel}
				</AppButton>
				{!creating && form.dirty && (
					<>
						<AppButton variant="secondary" onClick={() => form.resetForm()}>
							Discard
						</AppButton>
						<span className="text-sm text-(--pg-text-secondary)">
							Unsaved changes
						</span>
					</>
				)}
			</div>
			<ConfirmModal refName={confirmRef} />
		</form>
	);
}

DetailsForm.propTypes = {
	config: PropTypes.object.isRequired,
	profile: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
	submitLabel: PropTypes.string,
};

export default DetailsForm;
