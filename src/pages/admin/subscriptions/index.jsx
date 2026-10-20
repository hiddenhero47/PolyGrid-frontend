import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuUsers } from 'react-icons/lu';
import AdminServices from '../../../features/services/custom-hooks/admin';
import AdminPageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import CustomTable from '../../../components/table/custom-table';
import StatusBadge from '../../../components/status-badge';
import ProfileAvatar from '../../../components/profile-avatar';
import { AppButton } from '../../../components/button';
import { CustomSelect } from '../../../components/form-components';
import { SYSTEM_ROLE, SYSTEM_ROLE_LABELS } from '../../../utilities/app-const';
import { enumToOptions, formatDate } from '../../../utilities/basic-functions';
import GrantPanel from './elements/grant-panel';
import UserSearch from './elements/user-search';

const LIMIT = 10;
const OBJECT_ID = /^[a-f\d]{24}$/i;
const ROLE_OPTIONS = enumToOptions(SYSTEM_ROLE, SYSTEM_ROLE_LABELS);

// frontend-plan §C — Manual subscriptions: grant a plan by hand (sales
// deals, comp accounts, testing). Pick the user from the list (search by
// name or email), or arrive from a verification's "Grant a plan" link.
// URL: ?userId= (selected user) &q= &role= &page=
function AdminSubscriptions() {
	const [params, setParams] = useSearchParams();

	const userId = OBJECT_ID.test(params.get('userId') || '')
		? params.get('userId')
		: '';
	const role = params.has('role') ? params.get('role') : SYSTEM_ROLE.USER;
	const q = params.get('q') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);

	const users = AdminServices.getUsers({
		systemRole: role,
		q,
		page,
		limit: LIMIT,
	});
	// the selected user's details
	const selected = AdminServices.getUsers(
		{ userId, limit: 1 },
		{ enabled: Boolean(userId) }
	);
	const selectedUser = selected.data?.data?.[0];

	const update = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([key, value]) => {
			if (value || value === '') next.set(key, value);
			else next.delete(key);
		});
		setParams(next);
	};

	const select = (id) => {
		update({ userId: id });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const fields = [
		{
			Header: 'User',
			accessor: 'fullName',
			Cell: ({ row }) => (
				<span className="flex items-center gap-3">
					<ProfileAvatar
						avatar={row.original.avatar}
						name={row.original.fullName}
						size={36}
					/>
					<span className="min-w-0">
						<span className="block font-semibold">{row.original.fullName}</span>
						<span className="block text-sm text-(--pg-text-secondary)">
							{row.original.email}
						</span>
					</span>
				</span>
			),
		},
		{
			Header: 'Email',
			accessor: 'verified',
			Cell: ({ value }) => (
				<StatusBadge
					label={value ? 'Verified' : 'Unverified'}
					tone={value ? 'success' : 'warning'}
				/>
			),
		},
		{
			Header: 'Account',
			accessor: 'accountStatus',
			Cell: ({ value }) => (
				<StatusBadge
					label={value === 'suspended' ? 'Suspended' : 'Active'}
					tone={value === 'suspended' ? 'error' : 'neutral'}
				/>
			),
		},
		{
			Header: 'Plan',
			accessor: 'currentSubscription',
			Cell: ({ value }) => (value ? 'Subscribed' : '—'),
		},
		{
			Header: 'Joined',
			accessor: 'createdAt',
			Cell: ({ value }) => formatDate(value),
		},
		{
			Header: '',
			accessor: '_id',
			align: 'right',
			Cell: ({ value }) => (
				<AppButton
					size="sm"
					variant={value === userId ? 'primary' : 'secondary'}
					onClick={(e) => {
						e.stopPropagation();
						select(value);
					}}
				>
					{value === userId ? 'Selected' : 'Select'}
				</AppButton>
			),
		},
	];

	return (
		<>
			<AdminPageHeader
				eyebrow="Billing"
				title="Subscriptions"
				subtitle="Grant a plan by hand — for deals agreed offline, comp accounts or testing. It starts today and is recorded as a manual payment."
			/>

			{userId && (
				<GrantPanel
					key={userId}
					userId={userId}
					user={selectedUser}
					onClose={() => update({ userId: null })}
				/>
			)}

			<section aria-labelledby="users-heading">
				<div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<h3
						id="users-heading"
						className="font-label inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase"
					>
						<LuUsers aria-hidden="true" /> Users
						{users.data && ` · ${users.data.pagination.total.toLocaleString()}`}
					</h3>
					<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
						<UserSearch
							key={q}
							q={q}
							onSearch={(value) => update({ q: value || null, page: null })}
						/>
						<div className="sm:w-[200px]">
							<CustomSelect
								name="role"
								label="Role"
								placeholder="All roles"
								variant="outline"
								clearable
								options={ROLE_OPTIONS}
								value={role}
								onChange={(value) => update({ role: value || '', page: null })}
							/>
						</div>
					</div>
				</div>
				<CustomTable
					ariaLabel="Users"
					rowKey="_id"
					fields={fields}
					dataSource={users.data?.data || []}
					isLoading={users.isPending}
					isError={users.isError}
					refetch={users.refetch}
					pagination={users.data?.pagination}
					changePage={(next) =>
						update({ page: next > 1 ? String(next) : null })
					}
					onCallRow={(row) => select(row._id)}
					emptyText={q ? `No users match “${q}”` : 'No users match'}
					emptySbText={
						q ? 'Try part of the name or email, or another role.' : undefined
					}
				/>
			</section>
		</>
	);
}

export default AdminSubscriptions;
