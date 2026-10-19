import React, { useState } from 'react';
import { LuBriefcase } from 'react-icons/lu';
import CustomTable from '../../../components/table/custom-table';
import StatusBadge from '../../../components/status-badge';
import { JOB_STATUS } from '../../../utilities/app-const';
import { toast } from '../../../layouts/toast/toast-handler';
import { Tabs } from '../../home/elements/index.style';
import { LabSection } from './lab-section';

// frontend-plan §2: job status → badge
const JOB_STATUS_BADGES = {
	[JOB_STATUS.PENDING_CONFIRMATION]: { label: 'Pending', tone: 'warning' },
	[JOB_STATUS.ACTIVE]: { label: 'Active', tone: 'info' },
	[JOB_STATUS.COMPLETED]: { label: 'Completed', tone: 'success' },
	[JOB_STATUS.DISPUTED]: { label: 'Disputed', tone: 'special' },
	[JOB_STATUS.CANCELLED]: { label: 'Cancelled', tone: 'error' },
	[JOB_STATUS.CLOSED]: { label: 'Closed', tone: 'neutral' },
};

// 47 mock jobs, paged 5 at a time like a real list endpoint
const STATUSES = Object.values(JOB_STATUS);
const CLIENTS = [
	'Apex Heavy Engineering',
	'Harbor Works Ltd',
	'Stonegate Logistics',
	'Northline Rail',
	'Kora Builders',
];
const TITLES = [
	'Pile foundation review',
	'Steel frame inspection',
	'Drainage redesign',
	'Retaining wall audit',
	'Bridge deck survey',
	'Façade load check',
];
const ALL_JOBS = Array.from({ length: 47 }, (_, i) => ({
	_id: `job-${i + 1}`,
	ref: `PG-JOB-${String(4100 + i * 7)}`,
	title: TITLES[i % TITLES.length],
	client: CLIENTS[(i * 3) % CLIENTS.length],
	amount: 1200 + ((i * 937) % 18000),
	stages: `${(i % 4) + 1}/4`,
	status: STATUSES[(i * 5) % STATUSES.length],
	createdAt: new Date(2026, 9, 18 - i).toISOString(),
}));
const LIMIT = 5;

const MODES = ['data', 'loading', 'empty', 'error'];

const money = (value) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	}).format(value);

function TableDemo() {
	const [mode, setMode] = useState('data');
	const [page, setPage] = useState(1);

	const pagination = {
		total: ALL_JOBS.length,
		page,
		limit: LIMIT,
		totalPages: Math.ceil(ALL_JOBS.length / LIMIT),
	};
	const rows = ALL_JOBS.slice((page - 1) * LIMIT, page * LIMIT);

	const fields = [
		{
			Header: () => '#',
			accessor: 'nos',
			width: '56px',
			Cell: ({ nos }) => (
				<span className="text-(--pg-text-secondary)">{nos}</span>
			),
		},
		{
			Header: () => 'Job',
			accessor: 'title',
			Cell: ({ value, row }) => (
				<div className="flex flex-col">
					<span className="font-semibold">{value}</span>
					<span className="font-label text-[11px] tracking-[0.08em] text-(--pg-text-secondary)">
						{row.original.ref}
					</span>
				</div>
			),
		},
		{ Header: () => 'Client', accessor: 'client' },
		{ Header: () => 'Stages paid', accessor: 'stages', align: 'center' },
		{
			Header: () => 'Amount',
			accessor: 'amount',
			align: 'right',
			Cell: ({ value }) => <span className="tabular-nums">{money(value)}</span>,
		},
		{
			Header: () => 'Status',
			accessor: 'status',
			Cell: ({ value }) => (
				<StatusBadge status={value} map={JOB_STATUS_BADGES} />
			),
		},
		{
			Header: () => 'Created',
			accessor: 'createdAt',
			Cell: ({ value }) =>
				new Date(value).toLocaleDateString('en-GB', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				}),
		},
	];

	return (
		<LabSection
			id="tables"
			title="Table"
			note="HM's CustomTable API (fields with Header / accessor / Cell). Switch the state to see skeleton loading, empty and error. Rows are clickable — with the mouse or Tab + Enter. Pagination takes the backend's { total, page, limit, totalPages } directly."
		>
			<div className="mb-5 flex flex-wrap items-center gap-3">
				<span className="font-label text-[11px] font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
					State
				</span>
				<Tabs role="tablist" aria-label="Table state">
					{MODES.map((name) => (
						<button
							key={name}
							type="button"
							role="tab"
							className="sc_tab"
							aria-selected={mode === name}
							onClick={() => setMode(name)}
						>
							{name}
						</button>
					))}
				</Tabs>
			</div>

			<CustomTable
				ariaLabel="Jobs"
				fields={fields}
				dataSource={mode === 'data' ? rows : []}
				isLoading={mode === 'loading'}
				isError={mode === 'error'}
				pagination={mode === 'data' ? pagination : undefined}
				changePage={setPage}
				useStrip
				onCallRow={(job) => toast.info(`Open ${job.ref} — ${job.title}`)}
				emptyIcon={<LuBriefcase />}
				emptyText="No jobs yet"
				emptySbText="Jobs appear here once a client confirms a hire or awards a tender."
				refetch={() => setMode('data')}
				addData={() => toast.success('Would open “Post a job”')}
				addLabel="Post a job"
			/>
		</LabSection>
	);
}

export default TableDemo;
