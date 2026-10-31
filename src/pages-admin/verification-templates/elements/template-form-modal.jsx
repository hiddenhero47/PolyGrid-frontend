import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import {
	LuArrowDown,
	LuArrowUp,
	LuInfo,
	LuPlus,
	LuTrash2,
} from 'react-icons/lu';
import ReferenceServices from '../../../features/services/custom-hooks/reference';
import Modal from '../../../components/modal/index_modal';
import { toast } from '../../../layouts/toast/toast-handler';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomSelect,
	CustomTags,
	CustomToggle,
	CustomCheckboxGroup,
} from '../../../components/form-components';
import { TEMPLATE_FIELD_TYPE } from '../../../features/validations/template-form';
import {
	PROFILE_TYPE,
	PROFILE_TYPE_LABELS,
} from '../../../utilities/app-const';
import { enumToOptions } from '../../../utilities/basic-functions';
import {
	DOCUMENT_FORMAT_OPTIONS,
	FIELD_TYPE_OPTIONS,
	blankDocument,
	blankField,
	templatePayload,
	templateSchema,
	templateValues,
	toKey,
} from './template-schema';

const PROFILE_OPTIONS = enumToOptions(PROFILE_TYPE, PROFILE_TYPE_LABELS);

const rowClass =
	'flex flex-col gap-4 rounded-xl border border-(--pg-card-border) p-4';
const sectionTitle =
	'font-label text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase';

function RowTools({ index, count, onMove, onRemove, label }) {
	const btn =
		'inline-flex size-8 items-center justify-center rounded-lg text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-text-primary) disabled:opacity-30';
	return (
		<div className="flex items-center gap-1">
			<button
				type="button"
				className={btn}
				disabled={index === 0}
				onClick={() => onMove(index, -1)}
				aria-label={`Move ${label} up`}
			>
				<LuArrowUp aria-hidden="true" />
			</button>
			<button
				type="button"
				className={btn}
				disabled={index === count - 1}
				onClick={() => onMove(index, 1)}
				aria-label={`Move ${label} down`}
			>
				<LuArrowDown aria-hidden="true" />
			</button>
			<button
				type="button"
				className={`${btn} hover:text-(--pg-status-error)`}
				onClick={() => onRemove(index)}
				aria-label={`Remove ${label}`}
			>
				<LuTrash2 aria-hidden="true" />
			</button>
		</div>
	);
}

RowTools.propTypes = {
	index: PropTypes.number.isRequired,
	count: PropTypes.number.isRequired,
	onMove: PropTypes.func.isRequired,
	onRemove: PropTypes.func.isRequired,
	label: PropTypes.string.isRequired,
};

// Create a verification template — or the next version of one. The
// backend has no edit: saving always makes a new version for that
// (profile type, country, state) and retires the active one, so the form
// says so plainly. `base` pre-fills from an existing template; `templates`
// (the loaded list) tells it what's active for the chosen combination.
function TemplateFormModal({
	refName,
	base,
	templates = [],
	onSubmit,
	isPending,
}) {
	const form = useFormik({
		initialValues: templateValues(base),
		enableReinitialize: true,
		validationSchema: templateSchema,
		onSubmit: (values) => onSubmit(templatePayload(values)),
	});
	const { values } = form;
	const { data: countries = [] } = ReferenceServices.getCountries();
	const { data: states = [] } = ReferenceServices.getStates(values.country);
	const shown = (path) =>
		form.submitCount > 0 || form.touched[path.split('.')[0]];
	const errAt = (path) => {
		if (!shown(path)) return false;
		return (
			path
				.split('.')
				.reduce(
					(e, k) => (e && typeof e === 'object' ? e[k] : undefined),
					form.errors
				) || false
		);
	};
	const active = templates.find(
		(t) =>
			t.isActive &&
			t.profileType === values.profileType &&
			t.country === values.country &&
			(t.state || '') === (values.state || '')
	);

	const setList = (name, list) => form.setFieldValue(name, list);
	const move = (name) => (i, d) => {
		const list = [...values[name]];
		[list[i], list[i + d]] = [list[i + d], list[i]];
		setList(name, list);
	};
	const remove = (name) => (i) =>
		setList(
			name,
			values[name].filter((_, j) => j !== i)
		);
	const setRow = (name, i, patch) =>
		setList(
			name,
			values[name].map((row, j) => (j === i ? { ...row, ...patch } : row))
		);

	return (
		<Modal.Center
			refName={refName}
			width="900px"
			queryWidth="100%"
			onOpen={() => form.resetForm({ values: templateValues(base) })}
		>
			<Modal.Card
				eyebrow={base ? `New version of v${base.version}` : 'New template'}
				title={base ? base.name : 'Verification template'}
				subtitle="What someone fills in and uploads to get a profile verified, for one profile type in one country (or one state)."
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton type="submit" form="template-form" disabled={isPending}>
							{isPending
								? 'Saving…'
								: active
									? `Publish v${active.version + 1}`
									: 'Publish template'}
						</AppButton>
					</>
				}
			>
				<form
					id="template-form"
					noValidate
					onSubmit={(e) => {
						form.handleSubmit(e);
						form.validateForm().then((errors) => {
							if (Object.keys(errors).length)
								toast.error('Some fields need fixing — they’re marked in red.');
						});
					}}
					className="flex flex-col gap-7"
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<CustomSelect
							label="Profile type"
							name="profileType"
							required
							placeholder="Choose"
							options={PROFILE_OPTIONS}
							value={values.profileType}
							onChange={(v) => form.setFieldValue('profileType', v)}
							isError={errAt('profileType')}
							errormessage={form.errors.profileType}
						/>
						<CustomInput
							label="Name"
							name="name"
							required
							placeholder="e.g. Nigeria — contractor KYC"
							value={values.name}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={errAt('name')}
							errormessage={form.errors.name}
						/>
						<CustomSelect
							label="Country"
							name="country"
							required
							placeholder="Choose"
							options={countries.map((c) => ({
								value: c.isoCode,
								label: c.name,
							}))}
							value={values.country}
							onChange={(v) => {
								form.setFieldValue('country', v);
								form.setFieldValue('state', '');
							}}
							isError={errAt('country')}
							errormessage={form.errors.country}
						/>
						<CustomSelect
							label="State"
							name="state"
							placeholder={states.length ? 'Whole country' : '—'}
							hint="Only for a state with its own rules"
							clearable
							disabled={!states.length}
							options={states.map((s) => ({ value: s.isoCode, label: s.name }))}
							value={values.state}
							onChange={(v) => form.setFieldValue('state', v || '')}
						/>
					</div>

					{values.profileType && values.country && (
						<p className="flex items-start gap-2 rounded-xl bg-(--pg-surface-card) p-4 text-sm text-(--pg-text-primary)">
							<LuInfo
								aria-hidden="true"
								className="mt-0.5 shrink-0 text-(--pg-text-highlight)"
							/>
							{active
								? `This replaces “${active.name}” (v${active.version}), which is live now. From the moment you publish, new verifications use v${active.version + 1}; submissions already made keep the version they were made on. You can’t edit a version — publish another to change it.`
								: 'Nothing is live for this combination yet — this becomes v1. To change it later, publish a new version.'}
						</p>
					)}

					<section className="flex flex-col gap-3" aria-labelledby="tpl-fields">
						<div className="flex items-center justify-between gap-3">
							<h3 id="tpl-fields" className={sectionTitle}>
								Fields · {values.fields.length}
							</h3>
							<AppButton
								variant="secondary"
								icon={<LuPlus />}
								onClick={() =>
									setList('fields', [...values.fields, blankField()])
								}
							>
								Add field
							</AppButton>
						</div>
						{typeof form.errors.fields === 'string' && form.submitCount > 0 && (
							<p className="text-sm text-(--pg-status-error)">
								{form.errors.fields}
							</p>
						)}
						{values.fields.map((field, i) => {
							const at = (k) => `fields.${i}.${k}`;
							return (
								<div key={i} className={rowClass}>
									<div className="flex items-center justify-between gap-3">
										<span className="text-sm font-semibold text-(--pg-text-primary)">
											{i + 1}. {field.label || 'New field'}
										</span>
										<RowTools
											index={i}
											count={values.fields.length}
											onMove={move('fields')}
											onRemove={remove('fields')}
											label={`field ${i + 1}`}
										/>
									</div>
									<div className="grid gap-4 sm:grid-cols-3">
										<CustomInput
											label="Label"
											name={at('label')}
											required
											value={field.label}
											onChange={(e) =>
												setRow('fields', i, {
													label: e.target.value,
													...(!field.keyEdited && {
														key: toKey(e.target.value),
													}),
												})
											}
											isError={errAt(at('label'))}
											errormessage={errAt(at('label')) || ''}
										/>
										<CustomInput
											label="Key"
											name={at('key')}
											required
											hint="Stored under this name"
											value={field.key}
											onChange={(e) =>
												setRow('fields', i, {
													key: e.target.value,
													keyEdited: true,
												})
											}
											isError={errAt(at('key'))}
											errormessage={errAt(at('key')) || ''}
										/>
										<CustomSelect
											label="Type"
											name={at('type')}
											options={FIELD_TYPE_OPTIONS}
											value={field.type}
											onChange={(v) => setRow('fields', i, { type: v })}
										/>
									</div>
									{field.type === TEMPLATE_FIELD_TYPE.SELECT && (
										<CustomTags
											label="Choices"
											name={at('options')}
											placeholder="Type a choice, then Enter"
											value={field.options}
											onChange={(tags) =>
												setRow('fields', i, { options: tags })
											}
											isError={errAt(at('options'))}
											errormessage={errAt(at('options')) || ''}
										/>
									)}
									{field.type === TEMPLATE_FIELD_TYPE.STRING && (
										<div className="grid gap-4 sm:grid-cols-3">
											<CustomInput
												label="Pattern (regex)"
												name={at('pattern')}
												hint="Optional, e.g. ^RC\d{6,8}$"
												value={field.pattern}
												onChange={(e) =>
													setRow('fields', i, { pattern: e.target.value })
												}
												isError={errAt(at('pattern'))}
												errormessage={errAt(at('pattern')) || ''}
											/>
											<CustomInput
												label="Min length"
												name={at('minLength')}
												type="number"
												min="0"
												value={field.minLength}
												onChange={(e) =>
													setRow('fields', i, { minLength: e.target.value })
												}
											/>
											<CustomInput
												label="Max length"
												name={at('maxLength')}
												type="number"
												min="1"
												value={field.maxLength}
												onChange={(e) =>
													setRow('fields', i, { maxLength: e.target.value })
												}
											/>
										</div>
									)}
									{field.type === TEMPLATE_FIELD_TYPE.NUMBER && (
										<div className="grid gap-4 sm:grid-cols-2">
											<CustomInput
												label="Minimum"
												name={at('min')}
												type="number"
												value={field.min}
												onChange={(e) =>
													setRow('fields', i, { min: e.target.value })
												}
											/>
											<CustomInput
												label="Maximum"
												name={at('max')}
												type="number"
												value={field.max}
												onChange={(e) =>
													setRow('fields', i, { max: e.target.value })
												}
											/>
										</div>
									)}
									<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
										<CustomInput
											label="Help text"
											name={at('helpText')}
											placeholder="Shown under the field"
											value={field.helpText}
											onChange={(e) =>
												setRow('fields', i, { helpText: e.target.value })
											}
										/>
										<CustomToggle
											name={at('required')}
											checked={field.required}
											onChange={(e) =>
												setRow('fields', i, { required: e.target.checked })
											}
										>
											Required
										</CustomToggle>
									</div>
								</div>
							);
						})}
					</section>

					<section className="flex flex-col gap-3" aria-labelledby="tpl-docs">
						<div className="flex items-center justify-between gap-3">
							<h3 id="tpl-docs" className={sectionTitle}>
								Documents · {values.documents.length}
							</h3>
							<AppButton
								variant="secondary"
								icon={<LuPlus />}
								onClick={() =>
									setList('documents', [...values.documents, blankDocument()])
								}
							>
								Add document
							</AppButton>
						</div>
						{values.documents.length === 0 && (
							<p className="text-sm text-(--pg-text-secondary)">
								No uploads — the fields alone are enough.
							</p>
						)}
						{values.documents.map((doc, i) => {
							const at = (k) => `documents.${i}.${k}`;
							return (
								<div key={i} className={rowClass}>
									<div className="flex items-center justify-between gap-3">
										<span className="text-sm font-semibold text-(--pg-text-primary)">
											{i + 1}. {doc.label || 'New document'}
										</span>
										<RowTools
											index={i}
											count={values.documents.length}
											onMove={move('documents')}
											onRemove={remove('documents')}
											label={`document ${i + 1}`}
										/>
									</div>
									<div className="grid gap-4 sm:grid-cols-2">
										<CustomInput
											label="Label"
											name={at('label')}
											required
											placeholder="e.g. CAC certificate"
											value={doc.label}
											onChange={(e) =>
												setRow('documents', i, {
													label: e.target.value,
													...(!doc.keyEdited && {
														type: toKey(e.target.value),
													}),
												})
											}
											isError={errAt(at('label'))}
											errormessage={errAt(at('label')) || ''}
										/>
										<CustomInput
											label="Key"
											name={at('type')}
											required
											value={doc.type}
											onChange={(e) =>
												setRow('documents', i, {
													type: e.target.value,
													keyEdited: true,
												})
											}
											isError={errAt(at('type'))}
											errormessage={errAt(at('type')) || ''}
										/>
									</div>
									<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
										<CustomCheckboxGroup
											label="Accepted formats"
											name={at('acceptedFormats')}
											options={DOCUMENT_FORMAT_OPTIONS}
											columns={4}
											value={doc.acceptedFormats}
											setFieldValue={(_, list) =>
												setRow('documents', i, { acceptedFormats: list })
											}
											isError={errAt(at('acceptedFormats'))}
											errormessage={errAt(at('acceptedFormats')) || ''}
										/>
										<CustomToggle
											name={at('required')}
											checked={doc.required}
											onChange={(e) =>
												setRow('documents', i, { required: e.target.checked })
											}
										>
											Required
										</CustomToggle>
									</div>
								</div>
							);
						})}
					</section>
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

TemplateFormModal.propTypes = {
	refName: PropTypes.object.isRequired,
	base: PropTypes.object,
	templates: PropTypes.array,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default TemplateFormModal;
