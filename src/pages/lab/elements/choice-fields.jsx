import React, { useState } from 'react';
import {
	CustomCheckbox,
	CustomCheckboxGroup,
	CustomRadioGroup,
	CustomToggle,
} from '../../../components/form-components';
import { LabSection, StateCell } from './lab-section';

const DISCIPLINES = [
	{ value: 'structural', label: 'Structural engineering', meta: 482 },
	{ value: 'geotechnical', label: 'Geotechnical & foundations', meta: 291 },
	{ value: 'hydraulic', label: 'Hydraulic & marine', meta: 145 },
	{ value: 'architectural', label: 'Architectural', meta: 142 },
];

const TURNAROUND = [
	{ value: '24h', label: '≤ 24 hours' },
	{ value: '48h', label: '≤ 48 hours' },
	{ value: 'week', label: '5 to 7 days' },
];

const PRICING = [
	{
		value: 'fixed',
		label: 'Fixed package',
		description: 'One price for a defined deliverable.',
	},
	{ value: 'hourly', label: 'Hourly' },
	{
		value: 'per_session',
		label: 'Per session',
		description: 'A single scheduled call.',
	},
];

const GRID = 'grid gap-8 sm:grid-cols-2 xl:grid-cols-3';

function ChoiceFields() {
	const [terms, setTerms] = useState(false);
	const [disciplines, setDisciplines] = useState(['structural']);
	const [turnaround, setTurnaround] = useState('48h');
	const [pricing, setPricing] = useState('');
	const [mentor, setMentor] = useState(true);
	const [onBreak, setOnBreak] = useState(false);

	return (
		<LabSection
			id="choices"
			title="Checkbox, radio & toggle"
			note="All native inputs underneath (appearance: none), so Space, Tab and arrow keys work as the browser intends. Radio 'rows' is the Stitch filter look."
		>
			<div className={GRID}>
				<StateCell tag="Checkbox group (max 3)">
					<CustomCheckboxGroup
						label="Discipline"
						options={DISCIPLINES}
						value={disciplines}
						onChange={setDisciplines}
						max={3}
						hint="Counts on the right are the meta prop."
					/>
				</StateCell>

				<StateCell tag="Radio — rows">
					<CustomRadioGroup
						label="Max turnaround"
						variant="rows"
						name="turnaround"
						options={TURNAROUND}
						value={turnaround}
						onChange={setTurnaround}
					/>
				</StateCell>

				<StateCell tag="Radio — list, error">
					<CustomRadioGroup
						label="Pricing mode"
						name="pricing"
						required
						options={PRICING}
						value={pricing}
						onChange={setPricing}
						isError={!pricing}
						errormessage="Choose how you charge"
					/>
				</StateCell>

				<StateCell tag="Single checkbox">
					<CustomCheckbox
						checked={terms}
						onChange={(e) => setTerms(e.target.checked)}
						description="You can withdraw a bid until the deadline."
						isError={!terms}
						errormessage="Accept the terms to continue"
					>
						I agree to the tender terms
					</CustomCheckbox>
				</StateCell>

				<StateCell tag="Toggles">
					<div className="flex flex-col gap-5">
						<CustomToggle
							checked={mentor}
							onChange={(e) => setMentor(e.target.checked)}
							hint="Juniors can request mentorship from you."
						>
							Accepting mentees
						</CustomToggle>
						<CustomToggle
							checked={onBreak}
							onChange={(e) => setOnBreak(e.target.checked)}
						>
							I&apos;m on a break (inactive)
						</CustomToggle>
						<CustomToggle checked={false} disabled>
							Banned (admin only)
						</CustomToggle>
					</div>
				</StateCell>

				<StateCell tag="Disabled">
					<div className="flex flex-col gap-4">
						<CustomCheckbox checked disabled>
							Verified profile
						</CustomCheckbox>
						<CustomCheckbox checked={false} disabled>
							Featured (subscription required)
						</CustomCheckbox>
					</div>
				</StateCell>
			</div>
		</LabSection>
	);
}

export default ChoiceFields;
