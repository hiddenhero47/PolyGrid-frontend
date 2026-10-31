import React from 'react';
import PropTypes from 'prop-types';
import {
	CustomRadioGroup,
	CustomSelect,
} from '../../../components/form-components';
import ReferenceServices from '../../../features/services/custom-hooks/reference';
import { FilterPanel } from '../../engineering/elements/index.style';

// Only what a directory's search route supports: its one "what they do"
// filter (dir.filter) + country — nothing that looks like it filters but
// doesn't.
function DirectoryFilters({
	dir,
	value,
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
					disabled={!value && !country}
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
				onChange={(next) => onChange({ country: next })}
				hint={countryOptions.length ? undefined : 'Loading countries…'}
			/>

			<CustomRadioGroup
				label={dir.filterLabel}
				name={`${idPrefix}-${dir.filter}`}
				variant="rows"
				options={[{ value: '', label: dir.filterAny }, ...dir.options]}
				value={value || ''}
				onChange={(next) => onChange({ [dir.filter]: next })}
			/>
		</FilterPanel>
	);
}

DirectoryFilters.propTypes = {
	dir: PropTypes.object.isRequired,
	value: PropTypes.string,
	country: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onReset: PropTypes.func.isRequired,
	idPrefix: PropTypes.string.isRequired,
};

export default DirectoryFilters;
