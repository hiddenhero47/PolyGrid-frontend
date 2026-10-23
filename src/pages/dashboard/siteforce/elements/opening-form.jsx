import React from 'react';
import PropTypes from 'prop-types';
import { LuLock } from 'react-icons/lu';
import ReferenceServices from '../../../../features/services/custom-hooks/reference';
import {
	CustomInput,
	CustomTextarea,
	CustomSelect,
	CustomDate,
	CustomFile,
	CustomRadioGroup,
} from '../../../../components/form-components';
import LocationPicker from '../../../../components/location-picker';
import {
	MAX_OPENING_FILES,
	PORTFOLIO_ACCEPT,
} from '../../../../utilities/app-const';
import { eyebrowClass } from '../../elements/panels';
import {
	EMPLOYMENT_OPTIONS,
	PAY_TYPE_OPTIONS,
	SKILL_OPTIONS,
	tomorrow,
} from './opening-schema';

// The opening's fields on a Formik instance, in the two tiers workers
// see (frontend-plan §B.12): what everyone eligible sees, then what only
// accepted workers see. `withFiles` adds attachments (create only).
function OpeningFields({ form, withFiles = false }) {
	const { data: countries = [] } = ReferenceServices.getCountries();
	const { data: states = [] } = ReferenceServices.getStates(
		form.values.country
	);
	const err = (name) =>
		((form.touched[name] || form.submitCount > 0) && form.errors[name]) ||
		false;
	const text = (name, props) => (
		<CustomInput
			name={name}
			value={form.values[name]}
			onChange={form.handleChange}
			onBlur={form.handleBlur}
			isError={err(name)}
			errormessage={form.errors[name]}
			{...props}
		/>
	);

	return (
		<div className="flex flex-col gap-8">
			<fieldset className="flex flex-col gap-5">
				<legend className={`${eyebrowClass} mb-4`}>
					What every eligible worker sees
				</legend>
				{text('title', {
					label: 'Job title',
					required: true,
					placeholder: 'e.g. 3 masons for a block wall, 2 weeks',
				})}
				<CustomTextarea
					label="Description"
					name="description"
					required
					minHeight="140px"
					maxLength={5000}
					placeholder="The work, hours, tools provided, what to bring."
					value={form.values.description}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('description')}
					errormessage={form.errors.description}
				/>
				<div className="grid gap-5 sm:grid-cols-2">
					<CustomSelect
						label="Trade"
						name="category"
						required
						placeholder="Choose"
						options={SKILL_OPTIONS}
						value={form.values.category}
						onChange={(v) => form.setFieldValue('category', v)}
						onBlur={form.handleBlur}
						isError={err('category')}
						errormessage={form.errors.category}
					/>
					{text('workersNeeded', {
						label: 'Workers needed',
						type: 'number',
						inputMode: 'numeric',
						min: '1',
						required: true,
					})}
				</div>
				<div className="grid gap-5 sm:grid-cols-2">
					{text('payRate', {
						label: 'Pay (USD)',
						type: 'number',
						inputMode: 'decimal',
						min: '0',
						step: '0.01',
						required: true,
					})}
					<CustomSelect
						label="Paid"
						name="payType"
						options={PAY_TYPE_OPTIONS}
						value={form.values.payType}
						onChange={(v) => form.setFieldValue('payType', v)}
					/>
				</div>
				<CustomRadioGroup
					label="Length"
					name="employmentType"
					options={EMPLOYMENT_OPTIONS}
					value={form.values.employmentType}
					onChange={(v) => form.setFieldValue('employmentType', v)}
				/>
				<div className="grid gap-5 sm:grid-cols-3">
					<CustomSelect
						label="Country"
						name="country"
						required
						placeholder="Choose"
						options={countries.map((c) => ({
							value: c.isoCode,
							label: c.name,
						}))}
						value={form.values.country}
						onChange={(v) => {
							form.setFieldValue('country', v);
							form.setFieldValue('state', '');
						}}
						onBlur={form.handleBlur}
						isError={err('country')}
						errormessage={form.errors.country}
					/>
					<CustomSelect
						label="State / region"
						name="state"
						placeholder={states.length ? 'Any' : '—'}
						clearable
						disabled={!states.length}
						options={states.map((s) => ({ value: s.isoCode, label: s.name }))}
						value={form.values.state}
						onChange={(v) => form.setFieldValue('state', v || '')}
					/>
					{text('city', { label: 'City / area', placeholder: 'e.g. Lekki' })}
				</div>
				<CustomDate
					label="Applications close"
					name="applicationDeadline"
					hint="Optional — leave empty to keep it open until filled"
					min={tomorrow()}
					value={form.values.applicationDeadline}
					onChange={form.handleChange}
					isError={err('applicationDeadline')}
					errormessage={form.errors.applicationDeadline}
				/>
			</fieldset>

			<fieldset className="flex flex-col gap-5">
				<legend
					className={`${eyebrowClass} mb-2 inline-flex items-center gap-2`}
				>
					<LuLock aria-hidden="true" /> Only for workers you accept
				</legend>
				<p className="-mt-2 text-sm text-(--pg-text-secondary)">
					Applicants see the general area above. The exact spot, address,
					contact and files unlock only once you accept someone.
				</p>
				<LocationPicker
					label="Exact site location"
					hint="Click the map to drop a pin, use your location, or paste coordinates. Optional, but it lets workers search by distance."
					value={form.values.coordinates}
					onChange={(point) => form.setFieldValue('coordinates', point)}
				/>
				{text('address', {
					label: 'Address',
					placeholder: 'Street, landmark, gate',
				})}
				<div className="grid gap-5 sm:grid-cols-2">
					{text('googleMapsUrl', {
						label: 'Map link',
						placeholder: 'https://maps.app.goo.gl/…',
						hint: 'Optional',
					})}
					{text('contactInfo', {
						label: 'Site contact',
						placeholder: 'Name and phone of who to meet',
						hint: 'Optional',
					})}
				</div>
				{withFiles && (
					<CustomFile
						label="Site photos"
						hint={`Up to ${MAX_OPENING_FILES} · JPG, PNG or AVIF · 10 MB each — the site, access, what’s there.`}
						multiple
						maxFiles={MAX_OPENING_FILES}
						accept={PORTFOLIO_ACCEPT}
						acceptLabel="JPG, PNG or AVIF"
						value={form.values.files}
						onChange={(files) => form.setFieldValue('files', files)}
					/>
				)}
			</fieldset>
		</div>
	);
}

OpeningFields.propTypes = {
	form: PropTypes.object.isRequired,
	withFiles: PropTypes.bool,
};

export default OpeningFields;
