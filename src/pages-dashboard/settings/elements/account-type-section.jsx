import React from 'react';
import { useSelector } from 'react-redux';
import AccountServices from '../../../features/services/custom-hooks/account';
import { toast } from '../../../layouts/toast/toast-handler';
import SegmentedControl from '../../../components/segmented-control';
import { ACCOUNT_TYPE } from '../../../utilities/app-const';
import SettingsCard from './settings-card';

// PATCH /api/users/account-type — the persona switch (frontend-plan §B.2).
function AccountTypeSection() {
	const { user } = useSelector((state) => state.auth);
	const setType = AccountServices.setAccountType();

	return (
		<SettingsCard
			id="account-type-settings"
			title="Account type"
			description="Personal for hiring and buying; Business when you’re mainly selling your services or products. You can switch any time — your profiles stay as they are."
		>
			<SegmentedControl
				label="Account type"
				options={[
					{ value: ACCOUNT_TYPE.NORMAL, label: 'Personal' },
					{ value: ACCOUNT_TYPE.BUSINESS, label: 'Business' },
				]}
				value={user?.activeAccountType}
				onChange={(value) =>
					value !== user?.activeAccountType &&
					setType.mutate(value, {
						onSuccess: () =>
							toast.success(
								value === ACCOUNT_TYPE.BUSINESS
									? 'Switched to a business account'
									: 'Switched to a personal account'
							),
					})
				}
			/>
		</SettingsCard>
	);
}

export default AccountTypeSection;
