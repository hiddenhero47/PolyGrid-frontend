import React, { useRef, useState } from 'react';
import {
	LuTrash2,
	LuSlidersHorizontal,
	LuPanelLeft,
	LuPanelBottom,
	LuSquarePen,
	LuLock,
} from 'react-icons/lu';
import Modal from '../../../components/modal/index_modal';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomSelect,
	CustomDate,
	CustomTextarea,
	CustomCheckboxGroup,
	CustomRadioGroup,
	CustomToggle,
} from '../../../components/form-components';
import { SPECIALIZATION } from '../../../utilities/app-const';
import { enumToOptions } from '../../../utilities/basic-functions';
import { toast } from '../../../layouts/toast/toast-handler';
import { LabSection } from './lab-section';

const SPECIALIZATION_OPTIONS = enumToOptions(SPECIALIZATION, {
	hydraulic_water: 'Hydraulic & water',
});

function ModalDemo() {
	const confirmRef = useRef(null);
	const formRef = useRef(null);
	const filterRef = useRef(null);
	const leftRef = useRef(null);
	const sheetRef = useRef(null);
	const lockedRef = useRef(null);

	const [form, setForm] = useState({
		title: '',
		specialization: '',
		due: '',
		note: '',
	});
	const [filters, setFilters] = useState({
		disciplines: ['structural'],
		turnaround: '48h',
		mentors: false,
	});

	return (
		<LabSection
			id="modals"
			title="Modals"
			note="HM's API (refName + ref.current.open() / close()), now on dialog.showModal(): focus is trapped and returns to the button on close, Escape and a backdrop click close it, the page behind can't scroll. Open and close both animate in CSS."
		>
			<div className="flex flex-wrap gap-3">
				<AppButton
					variant="secondary"
					icon={<LuTrash2 />}
					onClick={() => confirmRef.current.open()}
				>
					Center · confirm
				</AppButton>
				<AppButton
					variant="secondary"
					icon={<LuSquarePen />}
					onClick={() => formRef.current.open()}
				>
					Center · form
				</AppButton>
				<AppButton
					variant="secondary"
					icon={<LuSlidersHorizontal />}
					onClick={() => filterRef.current.open()}
				>
					Right · filters
				</AppButton>
				<AppButton
					variant="secondary"
					icon={<LuPanelLeft />}
					onClick={() => leftRef.current.open()}
				>
					Left · drawer
				</AppButton>
				<AppButton
					variant="secondary"
					icon={<LuPanelBottom />}
					onClick={() => sheetRef.current.open()}
				>
					Bottom · sheet
				</AppButton>
				<AppButton
					variant="secondary"
					icon={<LuLock />}
					onClick={() => lockedRef.current.open()}
				>
					Not dismissible
				</AppButton>
			</div>

			{/* Center: confirm */}
			<Modal.Center refName={confirmRef} width="440px" queryWidth="100%">
				<Modal.Card
					eyebrow="Tender PG-9024"
					title="Withdraw your bid?"
					subtitle="The poster won't see it any more. You can bid again until the deadline."
					footer={
						<>
							<AppButton
								variant="secondary"
								onClick={() => confirmRef.current.close()}
							>
								Keep bid
							</AppButton>
							<AppButton
								onClick={() => {
									confirmRef.current.close();
									toast.success('Bid withdrawn');
								}}
							>
								Withdraw
							</AppButton>
						</>
					}
				/>
			</Modal.Center>

			{/* Center: a form — select and date popovers open above the modal */}
			<Modal.Center refName={formRef} width="560px" queryWidth="100%">
				<Modal.Card
					eyebrow="New job opening"
					title="Post a site job"
					footer={
						<>
							<AppButton
								variant="secondary"
								onClick={() => formRef.current.close()}
							>
								Cancel
							</AppButton>
							<AppButton
								onClick={() => {
									formRef.current.close();
									toast.success('Saved (demo)');
								}}
							>
								Save
							</AppButton>
						</>
					}
				>
					<div className="grid gap-5 sm:grid-cols-2">
						<CustomInput
							label="Title"
							placeholder="e.g. Rebar fixers needed"
							value={form.title}
							onChange={(e) => setForm({ ...form, title: e.target.value })}
							className="sm:col-span-2"
						/>
						<CustomSelect
							label="Specialization"
							placeholder="Choose one"
							options={SPECIALIZATION_OPTIONS}
							value={form.specialization}
							onChange={(value) => setForm({ ...form, specialization: value })}
						/>
						<CustomDate
							label="Application deadline"
							value={form.due}
							onChange={(e) => setForm({ ...form, due: e.target.value })}
						/>
						<CustomTextarea
							label="Notes"
							placeholder="Shift times, PPE, access…"
							value={form.note}
							onChange={(e) => setForm({ ...form, note: e.target.value })}
							className="sm:col-span-2"
						/>
					</div>
				</Modal.Card>
			</Modal.Center>

			{/* Right: filter drawer */}
			<Modal.Right refName={filterRef} width="380px" queryWidth="100%">
				<Modal.Card
					eyebrow="Browse consultants"
					title="Filters"
					footer={
						<>
							<AppButton
								variant="secondary"
								onClick={() =>
									setFilters({
										disciplines: [],
										turnaround: '',
										mentors: false,
									})
								}
							>
								Reset
							</AppButton>
							<AppButton onClick={() => filterRef.current.close()}>
								Show results
							</AppButton>
						</>
					}
				>
					<div className="flex flex-col gap-7">
						<CustomCheckboxGroup
							label="Discipline"
							options={SPECIALIZATION_OPTIONS}
							value={filters.disciplines}
							onChange={(value) =>
								setFilters({ ...filters, disciplines: value })
							}
						/>
						<CustomRadioGroup
							label="Max turnaround"
							variant="rows"
							name="drawer-turnaround"
							options={[
								{ value: '24h', label: '≤ 24 hours' },
								{ value: '48h', label: '≤ 48 hours' },
								{ value: 'week', label: '5 to 7 days' },
							]}
							value={filters.turnaround}
							onChange={(value) =>
								setFilters({ ...filters, turnaround: value })
							}
						/>
						<CustomToggle
							checked={filters.mentors}
							onChange={(e) =>
								setFilters({ ...filters, mentors: e.target.checked })
							}
						>
							Accepting mentees only
						</CustomToggle>
					</div>
				</Modal.Card>
			</Modal.Right>

			{/* Left: drawer (HM's left modal) */}
			<Modal.Left refName={leftRef} width="320px" minWidth="86%">
				<Modal.Card eyebrow="Account" title="Menu">
					<ul className="flex flex-col gap-1">
						{[
							'Dashboard',
							'My jobs',
							'Tenders',
							'Store orders',
							'Messages',
							'Settings',
						].map((item) => (
							<li key={item}>
								<button
									type="button"
									className="w-full rounded-lg px-3 py-3 text-left text-[15px] text-(--pg-text-primary) hover:bg-(--pg-state-hover)"
									onClick={() => leftRef.current.close()}
								>
									{item}
								</button>
							</li>
						))}
					</ul>
				</Modal.Card>
			</Modal.Left>

			{/* Bottom: sheet */}
			<Modal.Bottom refName={sheetRef} width="640px" queryWidth="100%">
				<Modal.Card
					title="Share this profile"
					footer={
						<AppButton onClick={() => sheetRef.current.close()}>Done</AppButton>
					}
				>
					<p className="text-[15px] leading-relaxed text-(--pg-text-secondary)">
						Bottom sheets suit phones: quick actions without leaving the page.
						Grab bar on top, rounded top corners, slides up from the edge.
					</p>
				</Modal.Card>
			</Modal.Bottom>

			{/* Not dismissible: Escape and backdrop clicks are ignored */}
			<Modal.Center
				refName={lockedRef}
				width="460px"
				queryWidth="100%"
				dismissible={false}
			>
				<Modal.Card
					eyebrow="Verification"
					title="Finish your upload"
					subtitle="This one ignores Escape and backdrop clicks (dismissible={false}) — for steps that shouldn't be abandoned by accident."
					showClose={false}
					footer={
						<AppButton onClick={() => lockedRef.current.close()}>
							I understand
						</AppButton>
					}
				/>
			</Modal.Center>
		</LabSection>
	);
}

export default ModalDemo;
