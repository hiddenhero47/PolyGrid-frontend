import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CustomSelect } from '../../../components/form-components';
import { SPECIALIZATION } from '../../../utilities/app-const';
import { enumToOptions } from '../../../utilities/basic-functions';
import bimImage from '../../../assets/images/home/bim-blueprint.jpg';
import rebarImage from '../../../assets/images/home/steel-rebar.jpg';
import yardImage from '../../../assets/images/home/precast-yard.jpg';
import { LabSection, StateCell } from './lab-section';

// Built from the backend enum, never a hand-typed list (frontend-plan §3).
const SPECIALIZATION_OPTIONS = enumToOptions(SPECIALIZATION, {
	hydraulic_water: 'Hydraulic & water',
});

const IMAGE_OPTIONS = [
	{ value: 'bim', label: 'BIM model', image: bimImage },
	{ value: 'rebar', label: 'Steel rebar', image: rebarImage },
	{ value: 'precast', label: 'Precast beams', image: yardImage },
];

// A long list, to test scrolling and type-ahead (press a letter).
const COUNTRIES = [
	'Australia',
	'Brazil',
	'Canada',
	'Denmark',
	'Egypt',
	'France',
	'Germany',
	'Ghana',
	'India',
	'Ireland',
	'Italy',
	'Japan',
	'Kenya',
	'Mexico',
	'Netherlands',
	'Nigeria',
	'Norway',
	'Poland',
	'Portugal',
	'Qatar',
	'Rwanda',
	'Saudi Arabia',
	'Singapore',
	'South Africa',
	'Spain',
	'Sweden',
	'Tanzania',
	'Uganda',
	'United Arab Emirates',
	'United Kingdom',
	'United States',
	'Zambia',
].map((name) => ({ value: name, label: name }));

function LiveSelect({ initial = '', ...props }) {
	const [value, setValue] = useState(initial);
	return <CustomSelect value={value} onChange={setValue} {...props} />;
}

LiveSelect.propTypes = {
	initial: PropTypes.string,
};

const GRID = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';

function SelectFields({ variant }) {
	return (
		<LabSection
			id="select"
			title="Select"
			note={
				<>
					Built on the browser&apos;s Popover API — click outside or press
					Escape to close (Safari included), no useEffect. Keyboard: ↓/↑ to open
					and move, Home/End, Enter to pick, or type a letter to jump.
				</>
			}
		>
			<div className={GRID}>
				<StateCell tag="Normal (placeholder)">
					<LiveSelect
						label="Specialization"
						placeholder="Choose a specialization"
						hint="From the backend's SPECIALIZATION enum."
						options={SPECIALIZATION_OPTIONS}
						variant={variant}
					/>
				</StateCell>
				<StateCell tag="Filled">
					<LiveSelect
						label="Specialization"
						initial="geotechnical"
						options={SPECIALIZATION_OPTIONS}
						variant={variant}
					/>
				</StateCell>
				<StateCell tag="Disabled">
					<LiveSelect
						label="State"
						placeholder="Choose a country first"
						options={[]}
						disabled
						variant={variant}
					/>
				</StateCell>
				<StateCell tag="Error + empty">
					<LiveSelect
						label="Specialization"
						required
						placeholder="Choose a specialization"
						options={SPECIALIZATION_OPTIONS}
						isError
						errormessage="Pick a specialization"
						variant={variant}
					/>
				</StateCell>
				<StateCell tag="With images">
					<LiveSelect
						label="Category"
						initial="rebar"
						options={IMAGE_OPTIONS}
						variant={variant}
					/>
				</StateCell>
				<StateCell tag="Clearable, long list">
					<LiveSelect
						label="Country"
						placeholder="Any country"
						clearable
						options={COUNTRIES}
						variant={variant}
					/>
				</StateCell>
			</div>
		</LabSection>
	);
}

SelectFields.propTypes = {
	variant: PropTypes.oneOf(['filled', 'outline']).isRequired,
};

export default SelectFields;
