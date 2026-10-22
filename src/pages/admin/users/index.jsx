import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LuUserPlus, LuUsers } from 'react-icons/lu';
import AdminServices from '../../../features/services/custom-hooks/admin';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import CustomTable from '../../../components/table/custom-table';
import StatusBadge from '../../../components/status-badge';
import ProfileAvatar from '../../../components/profile-avatar';
import { AppButton } from '../../../components/button';
import { CustomSelect } from '../../../components/form-components';
import { SYSTEM_ROLE, SYSTEM_ROLE_LABELS } from '../../../utilities/app-const';
import { enumToOptions, formatDate } from '../../../utilities/basic-functions';
import UserSearch from '../elements/user-search';
import AddStaffModal from './elements/add-staff-modal';
import ManageUserModal from './elements/manage-user-modal';

const LIMIT = 15;
const ROLE_OPTIONS = enumToOptions(SYSTEM_ROLE, SYSTEM_ROLE_LABELS);

// frontend-plan §C.2 — User management. Admins can look; only the Super
// Admin can add staff, change roles or suspend. Nobody can manage their
// own account or the Super Admin's (the backend refuses too).
// URL: ?q=&role=&page=
function AdminUsers() {
	const [params, setParams] = useSearchParams();
	const { user: me } = useSelector((state) => state.auth);
	const isSuper = me?.systemRole === SYSTEM_ROLE.SUPER_ADMIN;
	const addRef = useRef(null);
	const manageRef = useRef(null);
	const [managing, setManaging] = useState(null);

	const q = params.get('q') || '';
	const role = params.get('role') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const users = AdminServices.getUsers({
		systemRole: role,
		q,
		page,
		limit: LIMIT,
	});

	const update = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([key, value]) => {
			if (value) next.set(key, value);
			else next.delete(key);
		});
		setParams(next);
	};

	const canManage = (u) =>
		isSuper && u._id !== me?.id && u.systemRole !== SYSTEM_ROLE.SUPER_ADMIN;

	const open = (u) => {
		setManaging(u);
		manageRef.current.open();
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
						<span className="block font-semibold">
							{row.original.fullName}
							{row.original._id === me?.id && (
								<span className="ml-2 text-xs font-normal text-(--pg-text-secondary)">
									(you)
								</span>
							)}
						</span>
						<span className="block text-sm text-(--pg-text-secondary)">
							{row.original.email}
						</span>
					</span>
				</span>
			),
		},
		{
			Header: 'Role',
			accessor: 'systemRole',
			Cell: ({ value }) => (
				<StatusBadge
					label={SYSTEM_ROLE_LABELS[value] || value}
					tone={
						value === SYSTEM_ROLE.USER
							? 'neutral'
							: value === SYSTEM_ROLE.SUPER_ADMIN
								? 'special'
								: 'info'
					}
				/>
			),
		},
		{
			Header: 'Account',
			accessor: 'accountStatus',
			Cell: ({ value }) => (
				<StatusBadge
					label={value === 'suspended' ? 'Suspended' : 'Active'}
					tone={value === 'suspended' ? 'error' : 'success'}
				/>
			),
		},
		{
			Header: 'Email',
			accessor: 'verified',
			Cell: ({ value }) => (value ? 'Verified' : 'Unverified'),
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
			Cell: ({ row }) =>
				canManage(row.original) ? (
					<AppButton
						size="sm"
						variant="secondary"
						onClick={(e) => {
							e.stopPropagation();
							open(row.original);
						}}
					>
						Manage
					</AppButton>
				) : null,
		},
	];

	return (
		<>
			<PageHeader
				eyebrow="People"
				title="Users"
				subtitle={
					isSuper
						? 'Everyone on PolyGrid. Add staff, change roles, and suspend or reinstate accounts.'
						: 'Everyone on PolyGrid. Only the Super Admin can change roles or suspend accounts.'
				}
				actions={
					isSuper && (
						<AppButton
							icon={<LuUserPlus />}
							onClick={() => addRef.current.open()}
						>
							Add staff
						</AppButton>
					)
				}
			/>

			<div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<h3 className="font-label inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
					<LuUsers aria-hidden="true" />
					{users.data
						? `${users.data.pagination.total.toLocaleString()} users`
						: 'Users'}
				</h3>
				<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end md:w-auto">
					<UserSearch
						key={q}
						q={q}
						onSearch={(value) => update({ q: value, page: null })}
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
							onChange={(value) => update({ role: value, page: null })}
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
				changePage={(next) => update({ page: next > 1 ? String(next) : null })}
				onCallRow={(row) => canManage(row) && open(row)}
				emptyText={q ? `No users match “${q}”` : 'No users match'}
			/>

			{isSuper && <AddStaffModal refName={addRef} />}
			<ManageUserModal
				refName={manageRef}
				user={managing}
				onClose={() => setManaging(null)}
			/>
		</>
	);
}

export default AdminUsers;
