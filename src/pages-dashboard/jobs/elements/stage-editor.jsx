import React from 'react';
import PropTypes from 'prop-types';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomTags,
} from '../../../components/form-components';
import { formatMoney } from '../../../utilities/basic-functions';
import { stagesTotal } from './job-helpers';

// The job's stage breakdown: each stage is a % of the total (they may
// not add up to more than 100) plus what it covers. No stages = one
// simple 100% stage (the backend's default).
function StageEditor({ value = [], onChange, totalAmount, currency, error }) {
	const total = stagesTotal(value);
	const set = (i, patch) =>
		onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));

	return (
		<div className="flex flex-col gap-3">
			{value.length === 0 && (
				<p className="text-sm text-(--pg-text-secondary)">
					One stage, paid in full when it’s verified. Add stages to pay in
					parts.
				</p>
			)}
			<ol className="flex flex-col gap-3">
				{value.map((stage, i) => (
					<li
						key={i}
						className="rounded-xl border border-(--pg-card-border) p-3"
					>
						<div className="mb-2 flex items-center justify-between gap-3">
							<span className="font-label text-[11px] font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
								Stage {i + 1}
								{Number(totalAmount) > 0 &&
									Number(stage.payment) > 0 &&
									` · ${formatMoney((Number(totalAmount) * Number(stage.payment)) / 100, currency)}`}
							</span>
							<button
								type="button"
								onClick={() => onChange(value.filter((_, j) => j !== i))}
								aria-label={`Remove stage ${i + 1}`}
								className="rounded-lg p-1.5 text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-status-error)"
							>
								<LuTrash2 aria-hidden="true" />
							</button>
						</div>
						<div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
							<CustomInput
								label="Share (%)"
								name={`stages.${i}.payment`}
								type="number"
								inputMode="numeric"
								min="0"
								max="100"
								value={stage.payment}
								onChange={(e) => set(i, { payment: e.target.value })}
							/>
							<CustomTags
								label="What it covers"
								name={`stages.${i}.details`}
								placeholder="e.g. Foundation design, then Enter"
								max={10}
								maxLength={120}
								value={stage.details || []}
								onChange={(details) => set(i, { details })}
							/>
						</div>
					</li>
				))}
			</ol>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<AppButton
					size="sm"
					variant="secondary"
					icon={<LuPlus />}
					onClick={() => onChange([...value, { payment: '', details: [] }])}
				>
					Add stage
				</AppButton>
				{value.length > 0 && (
					<span
						className={`text-sm font-semibold ${total > 100 ? 'text-(--pg-form-error)' : 'text-(--pg-text-secondary)'}`}
					>
						{total}% of 100% allocated
					</span>
				)}
			</div>
			{error && (
				<p role="alert" className="text-sm text-(--pg-form-error)">
					{error}
				</p>
			)}
		</div>
	);
}

StageEditor.propTypes = {
	value: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	totalAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	currency: PropTypes.string,
	error: PropTypes.node,
};

export default StageEditor;
