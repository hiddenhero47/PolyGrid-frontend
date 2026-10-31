import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminMoneyServices from '../../features/services/custom-hooks/admin-money';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import Modal from '../../components/modal/index_modal';
import CustomTable from '../../components/table/custom-table';
import StatusBadge from '../../components/status-badge';
import { CustomSelect } from '../../components/form-components';
import JobReview from '../elements/job-review';
import UserSearch from '../elements/user-search';
import {
	JOB_STATUS,
	JOB_STATUS_BADGES,
	JOB_TYPE_LABELS,
} from '../../utilities/app-const';
import { formatDate, formatMoney } from '../../utilities/basic-functions';

const LIMIT = 20;
const STATUS_OPTIONS = Object.values(JOB_STATUS).map((value) => ({
	value,
	label: JOB_STATUS_BADGES[value]?.label || value,
}));

const party = (p) => p?.user?.fullName || '—';

// Find any job (admin / super_admin) — by title or either party's name /
// email, and by status — and open it: its money, history and payments,
// and recording a payment made outside Stripe.
// URL: ?q=&status=&page=
function AdminJobs() {
	const [params, setParams] = useSearchParams();
	const q = params.get('q') || '';
	const status = params.get('status') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const jobs = AdminMoneyServices.searchJobs({ q, status, page, limit: LIMIT });
	const drawerRef = useRef(null);
	const [jobId, setJobId] = useState(null);

	const update = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([k, v]) =>
			v ? next.set(k, v) : next.delete(k)
		);
		next.delete('page');
		setParams(next);
	};

	const fields = [
		{
			Header: 'Job',
			accessor: 'jobTitle',
			Cell: ({ row: { original: job } }) => (
				<span>
					<strong className="text-(--pg-text-primary)">{job.jobTitle}</strong>
					<span className="block text-xs text-(--pg-text-secondary)">
						{JOB_TYPE_LABELS[job.jobType] || job.jobType} ·{' '}
						{formatDate(job.createdAt)}
					</span>
				</span>
			),
		},
		{ Header: 'Client', accessor: 'client', Cell: ({ value }) => party(value) },
		{
			Header: 'Provider',
			accessor: 'provider',
			Cell: ({ value }) => party(value),
		},
		{
			Header: 'Funded',
			accessor: 'amountPaid',
			align: 'right',
			Cell: ({ row: { original: job } }) => (
				<span>
					{formatMoney(job.amountPaid || 0, job.currency)}
					<span className="block text-xs text-(--pg-text-secondary)">
						of {formatMoney(job.totalAmount, job.currency)}
					</span>
				</span>
			),
		},
		{
			Header: 'Status',
			accessor: 'status',
			Cell: ({ value }) => (
				<StatusBadge status={value} map={JOB_STATUS_BADGES} />
			),
		},
	];

	return (
		<>
			<PageHeader
				eyebrow="Billing"
				title="Jobs"
				subtitle="Every job on PolyGrid. Open one to see its money and history, or to record a payment the client made outside Stripe."
			/>
			<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
				<UserSearch
					key={q}
					q={q}
					placeholder="Job title, name or email"
					onSearch={(value) => update({ q: value })}
				/>
				<div className="sm:w-60">
					<CustomSelect
						id="jobs-status"
						label="Status"
						placeholder="Any status"
						variant="outline"
						clearable
						options={STATUS_OPTIONS}
						value={status}
						onChange={(v) => update({ status: v })}
					/>
				</div>
			</div>
			<CustomTable
				ariaLabel="Jobs"
				rowKey="id"
				fields={fields}
				dataSource={jobs.data?.data || []}
				isLoading={jobs.isPending}
				isError={jobs.isError}
				refetch={jobs.refetch}
				pagination={jobs.data?.pagination}
				changePage={(next) => {
					const p = new URLSearchParams(params);
					if (next > 1) p.set('page', String(next));
					else p.delete('page');
					setParams(p);
				}}
				onCallRow={(job) => {
					setJobId(job.id);
					drawerRef.current.open();
				}}
				emptyText={q || status ? 'No jobs match' : 'No jobs yet'}
				emptySbText={
					q || status ? 'Try another name, email or status.' : undefined
				}
			/>
			<Modal.Right
				refName={drawerRef}
				width="560px"
				queryWidth="100%"
				onClose={() => setJobId(null)}
			>
				<Modal.Card eyebrow="Job" title="Job details">
					{jobId && <JobReview jobId={jobId} />}
				</Modal.Card>
			</Modal.Right>
		</>
	);
}

export default AdminJobs;
