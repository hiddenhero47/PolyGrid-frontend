import React from 'react';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import ProfileSection from './elements/profile-section';
import AccountTypeSection from './elements/account-type-section';
import PasswordSection from './elements/password-section';
import TwoFactorSection from './elements/two-factor-section';
import PayoutSection from './elements/payout-section';
import SessionsSection from './elements/sessions-section';

// frontend-plan §B.2 — Account Settings, one page in sections.
function AccountSettings() {
	return (
		<>
			<PageHeader
				eyebrow="Account"
				title="Settings"
				subtitle="Your personal details, security and where your earnings go."
			/>
			<ProfileSection />
			<AccountTypeSection />
			<PasswordSection />
			<TwoFactorSection />
			<PayoutSection />
			<SessionsSection />
		</>
	);
}

export default AccountSettings;
