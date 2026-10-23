import React from 'react';
import PropTypes from 'prop-types';
import { LuTrash2 } from 'react-icons/lu';
import ReferenceServices from '../../../../../features/services/custom-hooks/reference';
import {
	CustomInput,
	CustomSelect,
} from '../../../../../components/form-components';

// One "we deliver here, at this price" row. No state = the whole
// country; a state row overrides the country price for that state
// (models/productModel.ts). States come from the reference data, so only
// codes the backend accepts can be picked.
function ShippingRow({ index, row, countries, form, onRemove, canRemove }) {
	const { data: states = [] } = ReferenceServices.getStates(row.country);
	const name = (key) => `shippingLocations.${index}.${key}`;
	const touched = form.touched.shippingLocations?.[index] || {};
	const errors = form.errors.shippingLocations?.[index] || {};
	const err = (key) => (touched[key] || form.submitCount > 0) && errors[key];

	return (
		<li className="grid gap-3 rounded-xl border border-(--pg-card-border) p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px_auto] sm:items-start">
			<CustomSelect
				label="Country"
				name={name('country')}
				placeholder="Choose"
				options={countries}
				value={row.country}
				onChange={(value) => {
					form.setFieldValue(name('country'), value);
					form.setFieldValue(name('state'), '');
				}}
				isError={Boolean(err('country'))}
				errormessage={errors.country}
			/>
			<CustomSelect
				label="State"
				name={name('state')}
				placeholder={states.length ? 'Whole country' : '—'}
				clearable
				disabled={!states.length}
				options={states.map((s) => ({ value: s.isoCode, label: s.name }))}
				value={row.state || ''}
				onChange={(value) => form.setFieldValue(name('state'), value || '')}
			/>
			<CustomInput
				label="Delivery (USD)"
				name={name('price')}
				type="number"
				inputMode="decimal"
				min="0"
				step="0.01"
				value={row.price}
				onChange={form.handleChange}
				onBlur={form.handleBlur}
				isError={Boolean(err('price'))}
				errormessage={errors.price}
			/>
			<button
				type="button"
				onClick={onRemove}
				disabled={!canRemove}
				aria-label={`Remove delivery location ${index + 1}`}
				className="mt-[30px] inline-flex h-[46px] w-[46px] items-center justify-center rounded-lg text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-status-error) disabled:opacity-40"
			>
				<LuTrash2 aria-hidden="true" />
			</button>
		</li>
	);
}

ShippingRow.propTypes = {
	index: PropTypes.number.isRequired,
	row: PropTypes.object.isRequired,
	countries: PropTypes.array.isRequired,
	form: PropTypes.object.isRequired,
	onRemove: PropTypes.func.isRequired,
	canRemove: PropTypes.bool,
};

export default ShippingRow;
