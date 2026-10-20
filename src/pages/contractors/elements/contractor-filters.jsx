import React from 'react';
import PropTypes from 'prop-types';
import {
	CustomRadioGroup,
	CustomSelect,
} from '../../../components/form-components';
import ReferenceServices from '../../../features/services/custom-hooks/reference';
import { FilterPanel } from '../../engineering/elements/index.style';
import {
	CONTRACTOR_SPECIALTY,
	CONTRACTOR_SPECIALTY_LABELS,
} from '../../../utilities/app-const';
import { enumToOptions } from '../../../utilities/basic-functions';

// Only what GET /api/contractor-profiles supports: specialty + country.
const SPECIALTY_OPTIONS = [
	{ value: '', label: 'Any specialty' },
	...enumToOptions(CONTRACTOR_SPECIALTY, CONTRACTOR_SPECIALTY_LABELS),
];

function ContractorFilters({
	specialty,
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

	return (
		<FilterPanel>
			<div className="sc_head">
				Filters
				<button
					type="button"
					className="sc_reset"
					onClick={onReset}
					disabled={!specialty && !country}
				>
					Reset all
				</button>
			</div>

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

			<CustomRadioGroup
				label="Specialty"
				name={`${idPrefix}-specialty`}
				variant="rows"
				options={SPECIALTY_OPTIONS}
				value={specialty || ''}
				onChange={(value) => onChange({ specialty: value })}
			/>
		</FilterPanel>
	);
}

ContractorFilters.propTypes = {
	specialty: PropTypes.string,
	country: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onReset: PropTypes.func.isRequired,
	idPrefix: PropTypes.string.isRequired,
};

export default ContractorFilters;
