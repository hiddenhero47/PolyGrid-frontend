import React, { useState } from 'react';
import TextFields from './elements/text-fields';
import SelectFields from './elements/select-fields';
import ChoiceFields from './elements/choice-fields';
import FormikDemo from './elements/formik-demo';
import TableDemo from './elements/table-demo';
import ModalDemo from './elements/modal-demo';
import FeedbackDemo from './elements/feedback-demo';
import ConsultantPreview from './elements/consultant-preview';
import { Tabs } from '../home/elements/index.style';

// Development-only page (/lab): every shared component in every state, for
// building and testing them in isolation. Theme switch is in the navbar.

const SECTIONS = [
	{ id: 'inputs', label: 'Inputs' },
	{ id: 'password-textarea', label: 'Password & textarea' },
	{ id: 'dates', label: 'Date' },
	{ id: 'select', label: 'Select' },
	{ id: 'choices', label: 'Choices' },
	{ id: 'formik', label: 'Live form' },
	{ id: 'tables', label: 'Table' },
	{ id: 'modals', label: 'Modals' },
	{ id: 'feedback', label: 'Feedback' },
	{ id: 'consultant-cards', label: 'Cards' },
];

const VARIANTS = ['filled', 'outline'];

function Lab() {
	const [variant, setVariant] = useState('filled');

	return (
		<div className="mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-10 md:px-8 xl:px-12">
			<header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="font-label text-xs font-semibold tracking-[0.16em] text-(--pg-accent-default) uppercase">
						Dev only · /lab
					</p>
					<h1 className="font-display mt-2 text-5xl font-semibold text-(--pg-text-primary) uppercase">
						Component lab
					</h1>
					<nav
						className="mt-4 flex flex-wrap gap-x-5 gap-y-2"
						aria-label="Lab sections"
					>
						{SECTIONS.map(({ id, label }) => (
							<a
								key={id}
								href={`#${id}`}
								className="font-label text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
							>
								{label}
							</a>
						))}
					</nav>
				</div>
				<div className="flex flex-col gap-2">
					<span className="font-label text-[11px] font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
						Field variant
					</span>
					<Tabs role="tablist" aria-label="Field variant">
						{VARIANTS.map((name) => (
							<button
								key={name}
								type="button"
								role="tab"
								className="sc_tab"
								aria-selected={variant === name}
								onClick={() => setVariant(name)}
							>
								{name}
							</button>
						))}
					</Tabs>
				</div>
			</header>

			<TextFields variant={variant} />
			<SelectFields variant={variant} />
			<ChoiceFields />
			<FormikDemo />

			<TableDemo />
			<ModalDemo />
			<FeedbackDemo />
			<ConsultantPreview />
		</div>
	);
}

export default Lab;
