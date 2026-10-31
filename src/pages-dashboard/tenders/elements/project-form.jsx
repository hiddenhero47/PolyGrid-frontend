import React from 'react';
import PropTypes from 'prop-types';
import ReferenceServices from '../../../features/services/custom-hooks/reference';
import {
	CustomInput,
	CustomTextarea,
	CustomSelect,
	CustomDate,
	CustomFile,
} from '../../../components/form-components';
import {
	MAX_PROJECT_FILES,
	PROJECT_FILE_ACCEPT,
	PROJECT_FILE_ACCEPT_LABEL,
} from '../../../utilities/app-const';
import { CATEGORY_OPTIONS, tomorrow } from './project-schema';

// The project's fields, on a Formik instance. `withFiles` adds the
// attachments picker (create only — an existing project manages its
// files on its own page).
function ProjectFields({ form, withFiles = false }) {
	const { data: countries = [] } = ReferenceServices.getCountries();
	const { data: states = [] } = ReferenceServices.getStates(
		form.values.country
	);
	const err = (name) =>
		((form.touched[name] || form.submitCount > 0) && form.errors[name]) ||
		false;

	return (
		<div className="flex flex-col gap-5">
			<CustomInput
				label="Project title"
				name="title"
				required
				placeholder="e.g. 4-bedroom duplex — full structural works"
				value={form.values.title}
				onChange={form.handleChange}
				onBlur={form.handleBlur}
				isError={err('title')}
				errormessage={form.errors.title}
			/>
			<CustomTextarea
				label="Description & specs"
				name="description"
				required
				minHeight="160px"
				maxLength={5000}
				placeholder="Scope, specifications, site conditions, timeline, anything a contractor needs to price it."
				value={form.values.description}
				onChange={form.handleChange}
				onBlur={form.handleBlur}
				isError={err('description')}
				errormessage={form.errors.description}
			/>
			<div className="grid gap-5 sm:grid-cols-2">
				<CustomSelect
					label="Category"
					name="category"
					required
					placeholder="Choose"
					options={CATEGORY_OPTIONS}
					value={form.values.category}
					onChange={(v) => form.setFieldValue('category', v)}
					onBlur={form.handleBlur}
					isError={err('category')}
					errormessage={form.errors.category}
				/>
				<CustomDate
					label="Bids close"
					name="bidDeadline"
					required
					min={tomorrow()}
					value={form.values.bidDeadline}
					onChange={form.handleChange}
					isError={err('bidDeadline')}
					errormessage={form.errors.bidDeadline}
				/>
			</div>
			<div className="grid gap-5 sm:grid-cols-2">
				<CustomInput
					label="Budget from (USD)"
					name="budgetMin"
					type="number"
					inputMode="decimal"
					min="0"
					hint="Optional"
					value={form.values.budgetMin}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('budgetMin')}
					errormessage={form.errors.budgetMin}
				/>
				<CustomInput
					label="Budget to (USD)"
					name="budgetMax"
					type="number"
					inputMode="decimal"
					min="0"
					hint="Optional"
					value={form.values.budgetMax}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('budgetMax')}
					errormessage={form.errors.budgetMax}
				/>
			</div>
			<div className="grid gap-5 sm:grid-cols-2">
				<CustomSelect
					label="Country"
					name="country"
					required
					placeholder="Choose"
					options={countries.map((c) => ({ value: c.isoCode, label: c.name }))}
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
			</div>
			{withFiles && (
				<CustomFile
					label="Specs, drawings & site photos"
					hint={`Up to ${MAX_PROJECT_FILES} files · ${PROJECT_FILE_ACCEPT_LABEL} · 10 MB each. Only eligible contractors can open them.`}
					multiple
					maxFiles={MAX_PROJECT_FILES}
					accept={PROJECT_FILE_ACCEPT}
					acceptLabel={PROJECT_FILE_ACCEPT_LABEL}
					value={form.values.files}
					onChange={(files) => form.setFieldValue('files', files)}
				/>
			)}
		</div>
	);
}

ProjectFields.propTypes = {
	form: PropTypes.object.isRequired,
	withFiles: PropTypes.bool,
};

export default ProjectFields;
