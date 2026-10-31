import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SegmentedControl from '../../../components/segmented-control';
import { formatMoney } from '../../../utilities/basic-functions';

const METRICS = [
	{
		value: 'paymentsAmount',
		label: 'Payments',
		format: (v) => formatMoney(v || 0),
	},
	{ value: 'newJobs', label: 'New jobs', format: (v) => String(v || 0) },
	{ value: 'newUsers', label: 'New users', format: (v) => String(v || 0) },
];

const dayLabel = (iso) =>
	new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		timeZone: 'UTC',
	});

// The last 30 days as one bar per day — one measure at a time (one axis),
// one color, value on hover / focus, and the same numbers as a table.
function DailyBars({ series = [] }) {
	const [metric, setMetric] = useState('paymentsAmount');
	const { label, format } = METRICS.find((m) => m.value === metric);
	const values = series.map((d) => d[metric] || 0);
	const max = Math.max(...values, 0);
	const [hover, setHover] = useState(null);
	const shown = hover ?? series.length - 1;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<SegmentedControl
					label="Measure"
					options={METRICS}
					value={metric}
					onChange={setMetric}
				/>
				{series[shown] && (
					<p className="text-sm text-(--pg-text-secondary)" aria-live="polite">
						{dayLabel(series[shown].date)}:{' '}
						<strong className="text-(--pg-text-primary)">
							{format(series[shown][metric])}
						</strong>
					</p>
				)}
			</div>
			<div
				role="img"
				aria-label={`${label} per day for the last 30 days, peaking at ${format(max)}`}
				className="flex h-40 items-end gap-0.5 border-b border-(--pg-card-border)"
				onMouseLeave={() => setHover(null)}
			>
				{series.map((d, i) => {
					const v = d[metric] || 0;
					const height = max ? Math.max((v / max) * 100, v ? 2 : 0) : 0;
					return (
						<button
							key={d.date}
							type="button"
							tabIndex={-1}
							aria-hidden="true"
							onMouseEnter={() => setHover(i)}
							className="group flex h-full flex-1 items-end"
						>
							<span
								className={`block w-full rounded-t-[4px] ${hover === i ? 'bg-(--pg-text-primary)' : 'bg-(--pg-text-highlight)'}`}
								style={{ height: `${height}%` }}
							/>
						</button>
					);
				})}
			</div>
			<div className="flex justify-between text-xs text-(--pg-text-secondary)">
				<span>{series[0] && dayLabel(series[0].date)}</span>
				<span>{series.at(-1) && dayLabel(series.at(-1).date)}</span>
			</div>
			<details className="text-sm">
				<summary className="cursor-pointer text-(--pg-text-highlight)">
					Show as a table
				</summary>
				<table className="mt-3 w-full text-left">
					<thead className="text-xs text-(--pg-text-secondary)">
						<tr>
							<th className="py-1 font-semibold">Day</th>
							<th className="py-1 text-right font-semibold">Payments</th>
							<th className="py-1 text-right font-semibold">New jobs</th>
							<th className="py-1 text-right font-semibold">New users</th>
						</tr>
					</thead>
					<tbody className="text-(--pg-text-primary)">
						{series.map((d) => (
							<tr key={d.date} className="border-t border-(--pg-card-border)">
								<td className="py-1">{dayLabel(d.date)}</td>
								<td className="py-1 text-right">
									{formatMoney(d.paymentsAmount || 0)}
								</td>
								<td className="py-1 text-right">{d.newJobs || 0}</td>
								<td className="py-1 text-right">{d.newUsers || 0}</td>
							</tr>
						))}
					</tbody>
				</table>
			</details>
		</div>
	);
}

DailyBars.propTypes = { series: PropTypes.array };

export default DailyBars;
