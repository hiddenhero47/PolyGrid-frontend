import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuSearch, LuMail } from 'react-icons/lu';
import {
	CustomInput,
	CustomPassword,
	CustomTextarea,
	CustomDate,
} from '../../../components/form-components';
import { LabSection, StateCell } from './lab-section';

// Holds a demo's value so every cell stays interactive.
function Live({ initial = '', children }) {
	const [value, setValue] = useState(initial);
	return children(value, (e) => setValue(e?.target ? e.target.value : e));
}

Live.propTypes = {
	initial: PropTypes.any,
	children: PropTypes.func.isRequired,
};

const GRID = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';

function TextFields({ variant }) {
	return (
		<>
			<LabSection
				id="inputs"
				title="Text input"
				note="frontend-plan §3's five states. Click into any field to see Active (coral ring). Error shows with an empty field and with a value."
			>
				<div className={GRID}>
					<StateCell tag="Normal (empty)">
						<Live>
							{(value, set) => (
								<CustomInput
									label="Company name"
									placeholder="e.g. Apex Heavy Engineering"
									hint="As it appears on your registration."
									value={value}
									onChange={set}
									variant={variant}
								/>
							)}
						</Live>
					</StateCell>
					<StateCell tag="Filled">
						<Live initial="Apex Heavy Engineering">
							{(value, set) => (
								<CustomInput
									label="Company name"
									value={value}
									onChange={set}
									variant={variant}
								/>
							)}
						</Live>
					</StateCell>
					<StateCell tag="Disabled">
						<CustomInput
							label="Account ID"
							value="PG-USR-48213"
							disabled
							variant={variant}
						/>
					</StateCell>
					<StateCell tag="Error + empty">
						<Live>
							{(value, set) => (
								<CustomInput
									label="Email"
									required
									type="email"
									placeholder="you@company.com"
									value={value}
									onChange={set}
									isError
									errormessage="Email is required"
									variant={variant}
								/>
							)}
						</Live>
					</StateCell>
					<StateCell tag="Error + filled">
						<Live initial="apex@">
							{(value, set) => (
								<CustomInput
									label="Email"
									required
									type="email"
									value={value}
									onChange={set}
									isError
									errormessage="Enter a valid email address"
									variant={variant}
								/>
							)}
						</Live>
					</StateCell>
					<StateCell tag="With icons">
						<Live>
							{(value, set) => (
								<CustomInput
									label="Search"
									placeholder="Specialty, software or name…"
									startIcon={<LuSearch />}
									value={value}
									onChange={set}
									variant={variant}
								/>
							)}
						</Live>
					</StateCell>
				</div>
			</LabSection>

			<LabSection
				id="password-textarea"
				title="Password & textarea"
				note="Password has a show/hide toggle. Textarea grows by dragging and shows a live count when it has a maxLength."
			>
				<div className={GRID}>
					<StateCell tag="Password">
						<Live>
							{(value, set) => (
								<CustomPassword
									label="Password"
									placeholder="At least 8 characters"
									value={value}
									onChange={set}
									variant={variant}
								/>
							)}
						</Live>
					</StateCell>
					<StateCell tag="Password — error">
						<Live initial="short">
							{(value, set) => (
								<CustomPassword
									label="Confirm password"
									value={value}
									onChange={set}
									isError
									errormessage="Passwords don't match"
									variant={variant}
								/>
							)}
						</Live>
					</StateCell>
					<StateCell tag="Email + icon, outline">
						<Live>
							{(value, set) => (
								<CustomInput
									label="Work email"
									type="email"
									placeholder="you@company.com"
									endIcon={<LuMail />}
									value={value}
									onChange={set}
									variant="outline"
								/>
							)}
						</Live>
					</StateCell>
					<StateCell tag="Textarea with count">
						<Live>
							{(value, set) => (
								<CustomTextarea
									label="Project summary"
									placeholder="What was built, your role, the outcome…"
									maxLength={400}
									value={value}
									onChange={set}
									variant={variant}
								/>
							)}
						</Live>
					</StateCell>
					<StateCell tag="Textarea — disabled">
						<CustomTextarea
							label="Admin note"
							value="Locked after verification."
							disabled
							variant={variant}
						/>
					</StateCell>
				</div>
			</LabSection>

			<LabSection
				id="dates"
				title="Date"
				note="PolyGrid's own calendar on a popover (mouse/trackpad); touch screens get the native picker. Keyboard: arrows move a day/week, PageUp/PageDown a month (+Shift: a year), Home/End the week, Enter picks. 'Completed' uses min={started}: earlier days are struck through and can't be picked."
			>
				<Live initial={{ startedAt: '2026-03-02', completedAt: '' }}>
					{(dates, setDates) => (
						<div className={GRID}>
							<StateCell tag="Normal / filled">
								<CustomDate
									label="Started"
									value={dates.startedAt}
									onChange={(e) =>
										setDates({ ...dates, startedAt: e.target.value })
									}
									variant={variant}
								/>
							</StateCell>
							<StateCell tag="Linked min">
								<CustomDate
									label="Completed"
									hint="Can't be before the start date."
									min={dates.startedAt}
									value={dates.completedAt}
									onChange={(e) =>
										setDates({ ...dates, completedAt: e.target.value })
									}
									variant={variant}
								/>
							</StateCell>
							<StateCell tag="Native (what phones get)">
								<CustomDate
									label="Started — native"
									native
									value={dates.startedAt}
									onChange={(e) =>
										setDates({ ...dates, startedAt: e.target.value })
									}
									hint="Forced with native — touch screens get this automatically."
									variant={variant}
								/>
							</StateCell>
							<StateCell tag="Error + empty">
								<CustomDate
									label="Application deadline"
									required
									isError
									errormessage="Pick a deadline"
									variant={variant}
								/>
							</StateCell>
							<StateCell tag="Disabled">
								<CustomDate
									label="Application deadline"
									value="2026-11-30"
									disabled
									variant={variant}
								/>
							</StateCell>
						</div>
					)}
				</Live>
			</LabSection>
		</>
	);
}

TextFields.propTypes = {
	variant: PropTypes.oneOf(['filled', 'outline']).isRequired,
};

export default TextFields;
