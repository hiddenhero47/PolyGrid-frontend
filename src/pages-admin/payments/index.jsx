import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuX } from 'react-icons/lu';
import AdminMoneyServices from '../../features/services/custom-hooks/admin-money';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import Modal from '../../components/modal/index_modal';
import CustomTable from '../../components/table/custom-table';
import StatusBadge from '../../components/status-badge';
import { CustomSelect } from '../../components/form-components';
import JobReview from '../elements/job-review';
import {
	PAYMENT_PROVIDER_LABELS,
	PAYMENT_STATUS_BADGES,
	PAYMENT_TARGET_LABELS,
	PAYMENT_TARGET_TYPE,
} from '../../utilities/app-const';
import {
	enumToOptions,
	formatDate,
	formatMoney,
} from '../../utilities/basic-functions';

const LIMIT = 20;
const STATUS_OPTIONS = Object.entries(PAYMENT_STATUS_BADGES).map(
	([value, { label }]) => ({ value, label })
);
const TARGET_OPTIONS = enumToOptions(
	PAYMENT_TARGET_TYPE,
	PAYMENT_TARGET_LABELS
);
const PROVIDER_OPTIONS = Object.entries(PAYMENT_PROVIDER_LABELS).map(
	([value, label]) => ({ value, label })
);

// frontend-plan §C.10 — every payment on the platform (admin /
// super_admin): card payments through Stripe and payments an admin
// recorded by hand. Filters live in the URL:
// ?status=&targetType=&provider=&user=&page= — click a payer to see only
// theirs, and a job payment to open the job.
function PaymentsLedger() {
	const [params, setParams] = useSearchParams();
	const filters = {
		status: params.get('status') || '',
		targetType: params.get('targetType') || '',
		provider: params.get('provider') || '',
		user: params.get('user') || '',
	};
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const payments = AdminMoneyServices.payments({
		...filters,
		page,
		limit: LIMIT,
	});
	const drawerRef = useRef(null);
	const [jobId, setJobId] = useState(null);
	const rows = payments.data?.data || [];
	const userEmail =
		filters.user &&
		rows.find((r) => String(r.user) === filters.user)?.userEmail;

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
			Header: 'Date',
			accessor: 'createdAt',
			Cell: ({ row: { original: row } }) => formatDate(row.createdAt, true),
		},
		{
			Header: 'Paid by',
			accessor: 'userEmail',
			Cell: ({ row: { original: row } }) => (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						update({ user: String(row.user) });
					}}
					className="text-left text-(--pg-text-highlight) hover:underline"
					title="Only this person’s payments"
				>
					{row.userEmail || String(row.user)}
				</button>
			),
		},
		{
			Header: 'For',
			accessor: 'targetType',
			Cell: ({ row: { original: row } }) =>
				PAYMENT_TARGET_LABELS[row.targetType] || row.targetType,
		},
		{
			Header: 'How',
			accessor: 'provider',
			Cell: ({ row: { original: row } }) =>
				PAYMENT_PROVIDER_LABELS[row.provider] || row.provider,
		},
		{
			Header: 'Amount',
			accessor: 'amount',
			align: 'right',
			Cell: ({ row: { original: row } }) => (
				<strong>{formatMoney(row.amount, row.currency)}</strong>
			),
		},
		{
			Header: 'Status',
			accessor: 'status',
			Cell: ({ row: { original: row } }) => (
				<StatusBadge status={row.status} map={PAYMENT_STATUS_BADGES} />
			),
		},
	];

	return (
		<>
			<PageHeader
				eyebrow="Billing"
				title="Payments"
				subtitle="Every payment into PolyGrid — job escrow, subscriptions and digital files. Click a job payment to open its job."
			/>

			<div className="mb-5 grid gap-4 sm:grid-cols-3 lg:max-w-200">
				<CustomSelect
					id="pay-status"
					label="Status"
					placeholder="Any status"
					variant="outline"
					clearable
					options={STATUS_OPTIONS}
					value={filters.status}
					onChange={(v) => update({ status: v })}
				/>
				<CustomSelect
					id="pay-target"
					label="For"
					placeholder="Anything"
					variant="outline"
					clearable
					options={TARGET_OPTIONS}
					value={filters.targetType}
					onChange={(v) => update({ targetType: v })}
				/>
				<CustomSelect
					id="pay-provider"
					label="How"
					placeholder="Any way"
					variant="outline"
					clearable
					options={PROVIDER_OPTIONS}
					value={filters.provider}
					onChange={(v) => update({ provider: v })}
				/>
			</div>
			{filters.user && (
				<div className="mb-4">
					<button
						type="button"
						onClick={() => update({ user: '' })}
						className="inline-flex items-center gap-2 rounded-full border border-(--pg-card-border) px-3 py-1.5 text-sm text-(--pg-text-primary) hover:border-(--pg-card-borderHover)"
					>
						Paid by {userEmail || 'one person'} <LuX aria-label="Clear" />
					</button>
				</div>
			)}

			<CustomTable
				ariaLabel="Payments"
				rowKey="_id"
				fields={fields}
				dataSource={rows}
				isLoading={payments.isPending}
				isError={payments.isError}
				refetch={payments.refetch}
				pagination={payments.data?.pagination}
				changePage={(next) => {
					const p = new URLSearchParams(params);
					if (next > 1) p.set('page', String(next));
					else p.delete('page');
					setParams(p);
				}}
				onCallRow={(row) => {
					if (row.targetType !== 'Job') return;
					setJobId(String(row.targetId));
					drawerRef.current.open();
				}}
				emptyText="No payments match"
				emptySbText="Try clearing a filter."
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

export default PaymentsLedger;
