import React from 'react';
import PropTypes from 'prop-types';
import {
	CustomRadioGroup,
	CustomSelect,
} from '../../../components/form-components';
import ReferenceServices from '../../../features/services/custom-hooks/reference';
import { SPECIALIZATION } from '../../../utilities/app-const';
import { enumToOptions } from '../../../utilities/basic-functions';
import { SPECIALIZATION_LABELS } from '../../../utilities/app-const';
import { FilterPanel } from './index.style';

// Only the filters the backend actually supports
// (GET /api/consultancy-profiles?specialization=&country=) — nothing that
// would look like it filters but doesn't.
const SPECIALIZATION_OPTIONS = [
	{ value: '', label: 'Any discipline' },
	...enumToOptions(SPECIALIZATION, SPECIALIZATION_LABELS),
];

function ConsultantFilters({
	specialization,
	country,
	onChange,
	onReset,
	idPrefix,
}) {
	const { data: countries = [] } = ReferenceServices.getCountries();
	const countryOptions = countries.map((c) => ({
		value: c.isoCode,
		label: c.name,
	}));
	const hasFilters = Boolean(specialization || country);

	return (
		<FilterPanel>
			<div className="sc_head">
				Filters
				<button
					type="button"
					className="sc_reset"
					onClick={onReset}
					disabled={!hasFilters}
				>
					Reset all
				</button>
			</div>

			<CustomRadioGroup
				label="Discipline"
				name={`${idPrefix}-specialization`}
				variant="rows"
				options={SPECIALIZATION_OPTIONS}
				value={specialization || ''}
				onChange={(value) => onChange({ specialization: value })}
			/>

			<CustomSelect
				id={`${idPrefix}-country`}
				label="Country"
				placeholder="Any country"
				clearable
				options={countryOptions}
				value={country || ''}
				onChange={(value) => onChange({ country: value })}
				hint={countryOptions.length ? undefined : 'Loading countries…'}
			/>
		</FilterPanel>
	);
}

ConsultantFilters.propTypes = {
	specialization: PropTypes.string,
	country: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onReset: PropTypes.func.isRequired,
	idPrefix: PropTypes.string.isRequired,
};

export default ConsultantFilters;
