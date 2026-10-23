import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuLogOut } from 'react-icons/lu';
import AccountServices from '../../../features/services/custom-hooks/account';
import { toast } from '../../../layouts/toast/toast-handler';
import ConfirmModal from '../../../components/modal/confirm-modal';
import { AppButton } from '../../../components/button';
import { ROUTES } from '../../../utilities/app-routes';
import SettingsCard from './settings-card';

// PATCH /api/users/invalidate — ends every session, this one included.
function SessionsSection() {
	const navigate = useNavigate();
	const confirmRef = useRef(null);
	const logoutAll = AccountServices.logoutEverywhere();

	const run = async () => {
		const ok = await confirmRef.current.ask({
			title: 'Log out everywhere?',
			text: 'Every device signed in to this account — including this one — will need to sign in again.',
			confirmLabel: 'Log out everywhere',
		});
		if (!ok) return;
		logoutAll.mutate(undefined, {
			onSuccess: () => {
				toast.success('Signed out on every device');
				navigate(ROUTES.LOGIN, { replace: true });
			},
		});
	};

	return (
		<SettingsCard
			id="sessions-settings"
			title="Sessions"
			description="Lost a phone, or signed in on a shared computer? End every session at once."
		>
			<AppButton
				variant="secondary"
				icon={<LuLogOut />}
				onClick={run}
				disabled={logoutAll.isPending}
			>
				Log out everywhere
			</AppButton>
			<ConfirmModal refName={confirmRef} />
		</SettingsCard>
	);
}

export default SessionsSection;
