import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { LuSave } from 'react-icons/lu';
import ReferenceServices from '../../../../../features/services/custom-hooks/reference';
import { AppButton } from '../../../../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomSelect,
	CustomCheckboxGroup,
} from '../../../../../components/form-components';
import { consultancyDetailsSchema } from '../../../../../features/validations/profile-validation';
import {
	SPECIALIZATION,
	SPECIALIZATION_LABELS,
} from '../../../../../utilities/app-const';
import { enumToOptions } from '../../../../../utilities/basic-functions';

const SPECIALIZATION_OPTIONS = enumToOptions(
	SPECIALIZATION,
	SPECIALIZATION_LABELS
);

const detailsFromProfile = (profile = {}) => ({
	headline: profile.headline || '',
	country: profile.country || '',
	city: profile.city || '',
	yearsOfExperience: profile.yearsOfExperience ?? '',
	specializations: profile.specializations || [],
	bio: profile.bio || '',
});

// Only what the form edits — '' optional fields are left out on create
// and sent as '' on edit (clears them).
const toBody = (values, creating) => {
	const body = {
		headline: values.headline.trim(),
		country: values.country,
		specializations: values.specializations,
		city: values.city.trim(),
		bio: values.bio.trim(),
	};
	if (values.yearsOfExperience !== '' && values.yearsOfExperience != null) {
		body.yearsOfExperience = Number(values.yearsOfExperience);
	}
	if (creating) {
		if (!body.city) delete body.city;
		if (!body.bio) delete body.bio;
	}
	return body;
};

// Headline, disciplines, location, experience and bio — the create form
// and the editor's Details tab (POST / PATCH /api/consultancy-profiles).
function DetailsForm({
	profile,
	onSubmit,
	isPending,
	submitLabel = 'Save changes',
}) {
	const creating = !profile;
	const { data: countries = [] } = ReferenceServices.getCountries();

	const form = useFormik({
		initialValues: detailsFromProfile(profile),
		enableReinitialize: true,
		validationSchema: consultancyDetailsSchema,
		onSubmit: (values) => onSubmit(toBody(values, creating)),
	});
	const { data: cities = [] } = ReferenceServices.getCities(
		form.values.country
	);
	const err = (name) => (form.touched[name] && form.errors[name]) || false;
	const listId = 'consultancy-city-suggestions';

	return (
		<form
			noValidate
			onSubmit={form.handleSubmit}
			className="grid gap-5 lg:grid-cols-2"
		>
			<div className="lg:col-span-2">
				<CustomInput
					label="Headline"
					name="headline"
					required
					placeholder="e.g. Okonkwo Structural Consult"
					hint="Your practice or professional name — it’s the title of your public page."
					value={form.values.headline}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('headline')}
					errormessage={form.errors.headline}
				/>
			</div>

			<div className="lg:col-span-2">
				<CustomCheckboxGroup
					label="Disciplines"
					name="specializations"
					required
					options={SPECIALIZATION_OPTIONS}
					value={form.values.specializations}
					setFieldValue={(name, value) => {
						form.setFieldValue(name, value);
						form.setFieldTouched(name, true, false);
					}}
					isError={err('specializations')}
					errormessage={form.errors.specializations}
				/>
			</div>

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

			<div className="lg:col-span-2">
				<CustomTextarea
					label="About"
					name="bio"
					placeholder="What you design, check or inspect, the kinds of projects you take on, and where you work."
					minHeight="150px"
					maxLength={2000}
					value={form.values.bio}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('bio')}
					errormessage={form.errors.bio}
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
		</form>
	);
}

DetailsForm.propTypes = {
	profile: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
	submitLabel: PropTypes.string,
};

export default DetailsForm;
