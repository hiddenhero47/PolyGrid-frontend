import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { LuUserX, LuUserCheck } from 'react-icons/lu';
import AdminServices from '../../../features/services/custom-hooks/admin';
import { toast } from '../../../layouts/toast/toast-handler';
import Modal from '../../../components/modal/index_modal';
import ConfirmModal from '../../../components/modal/confirm-modal';
import ProfileAvatar from '../../../components/profile-avatar';
import StatusBadge from '../../../components/status-badge';
import { AppButton } from '../../../components/button';
import { CustomSelect } from '../../../components/form-components';
import { SYSTEM_ROLE, SYSTEM_ROLE_LABELS } from '../../../utilities/app-const';
import { formatDate } from '../../../utilities/basic-functions';

// The roles a super admin can hand out (super_admin itself is never
// assignable from here — there's exactly one).
const ROLE_OPTIONS = [
	SYSTEM_ROLE.USER,
	SYSTEM_ROLE.CUSTOMER_CARE,
	SYSTEM_ROLE.ADMIN,
].map((role) => ({ value: role, label: SYSTEM_ROLE_LABELS[role] }));

// One user's role and account status (frontend-plan §C.2). Suspending is
// account-wide and separate from banning a single business profile.
function ManageUserModal({ refName, user, onClose }) {
	const confirmRef = useRef(null);
	const changeRole = AdminServices.changeRole();
	const setStatus = AdminServices.setAccountStatus();
	const suspended = user?.accountStatus === 'suspended';

	const pickRole = async (systemRole) => {
		if (!user || systemRole === user.systemRole) return;
		const ok = await confirmRef.current.ask({
			title: `Make ${user.fullName} ${SYSTEM_ROLE_LABELS[systemRole].toLowerCase()}?`,
			text:
				systemRole === SYSTEM_ROLE.USER
					? 'They lose access to the Admin Dashboard.'
					: 'They get access to the Admin Dashboard with this role’s permissions.',
			confirmLabel: 'Change role',
		});
		if (!ok) return;
		changeRole.mutate(
			{ id: user._id, systemRole },
			{
				onSuccess: () => {
					toast.success('Role updated');
					refName.current.close();
				},
			}
		);
	};

	const toggleSuspension = async () => {
		const ok = await confirmRef.current.ask({
			title: suspended
				? `Reinstate ${user.fullName}?`
				: `Suspend ${user.fullName}?`,
			text: suspended
				? 'They can sign in and use PolyGrid again.'
				: 'They can’t sign in or use PolyGrid until reinstated. Their profiles stay as they are.',
			confirmLabel: suspended ? 'Reinstate' : 'Suspend',
		});
		if (!ok) return;
		setStatus.mutate(
			{ id: user._id, accountStatus: suspended ? 'active' : 'suspended' },
			{
				onSuccess: () => {
					toast.success(suspended ? 'Account reinstated' : 'Account suspended');
					refName.current.close();
				},
			}
		);
	};

	return (
		<>
			<Modal.Center
				refName={refName}
				width="520px"
				queryWidth="100%"
				onClose={onClose}
			>
				{user && (
					<Modal.Card
						eyebrow="Manage user"
						title={user.fullName}
						subtitle={user.email}
					>
						<div className="flex flex-col gap-6">
							<div className="flex items-center gap-4">
								<ProfileAvatar
									avatar={user.avatar}
									name={user.fullName}
									size={52}
								/>
								<div className="flex flex-wrap gap-2">
									<StatusBadge
										label={SYSTEM_ROLE_LABELS[user.systemRole]}
										tone={
											user.systemRole === SYSTEM_ROLE.USER ? 'neutral' : 'info'
										}
									/>
									<StatusBadge
										label={suspended ? 'Suspended' : 'Active'}
										tone={suspended ? 'error' : 'success'}
									/>
									<StatusBadge
										label={
											user.verified ? 'Email verified' : 'Email unverified'
										}
										tone={user.verified ? 'success' : 'warning'}
									/>
								</div>
							</div>
							<p className="text-sm text-(--pg-text-secondary)">
								Joined {formatDate(user.createdAt)}
							</p>

							<CustomSelect
								label="Role"
								name="systemRole"
								options={ROLE_OPTIONS}
								value={user.systemRole}
								onChange={pickRole}
								disabled={changeRole.isPending}
								hint="Staff roles open the Admin Dashboard."
							/>

							<div className="rounded-xl border border-(--pg-card-border) p-4">
								<p className="font-semibold text-(--pg-text-primary)">
									{suspended ? 'This account is suspended' : 'Suspend account'}
								</p>
								<p className="mt-1 text-sm text-(--pg-text-secondary)">
									{suspended
										? 'They can’t sign in until you reinstate them.'
										: 'Blocks sign-in and every action, across all their profiles.'}
								</p>
								<AppButton
									className="mt-4"
									size="sm"
									variant={suspended ? 'primary' : 'secondary'}
									icon={suspended ? <LuUserCheck /> : <LuUserX />}
									onClick={toggleSuspension}
									disabled={setStatus.isPending}
								>
									{suspended ? 'Reinstate' : 'Suspend'}
								</AppButton>
							</div>
						</div>
					</Modal.Card>
				)}
			</Modal.Center>
			<ConfirmModal refName={confirmRef} />
		</>
	);
}

ManageUserModal.propTypes = {
	refName: PropTypes.object.isRequired,
	user: PropTypes.object,
	onClose: PropTypes.func,
};

export default ManageUserModal;
