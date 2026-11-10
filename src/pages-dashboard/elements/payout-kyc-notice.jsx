import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { LuFingerprint } from 'react-icons/lu';
import PayoutKycServices from '../../features/services/custom-hooks/payout-kyc';
import { ROUTES } from '../../utilities/app-routes';
import { PAYOUT_KYC_STATUS } from '../../utilities/app-const';

// Next to anything that asks PolyGrid for money back or out (refund and
// payout requests): an admin can't approve one until the person receiving
// it has passed the payout identity check, so say so up front. Shows
// nothing once they're verified.
function PayoutKycNotice({ className = '' }) {
	const { data } = PayoutKycServices.getMine();
	if (!data) return null;
	const status = data.record?.status;
	if (status === PAYOUT_KYC_STATUS.VERIFIED) return null;

	const settings = (
		<Link
			to={`${ROUTES.DASHBOARD_SETTINGS}#payout-kyc-settings`}
			className="font-semibold underline"
		>
			{status === PAYOUT_KYC_STATUS.PENDING ? 'Settings' : 'Verify in Settings'}
		</Link>
	);

	return (
		<p
			role="status"
			className={`flex items-start gap-2 rounded-xl bg-(--pg-status-warningSoft) px-3 py-2.5 text-sm text-(--pg-text-primary) ${className}`}
		>
			<LuFingerprint
				aria-hidden="true"
				className="mt-0.5 shrink-0 text-(--pg-status-warning)"
			/>
			<span>
				{status === PAYOUT_KYC_STATUS.PENDING ? (
					<>
						We’re still checking your ID. Money can be sent to you once that’s
						done ({settings}).
					</>
				) : (
					<>
						We need to confirm your identity before we can send you a refund
						or payout. {settings}.
					</>
				)}
			</span>
		</p>
	);
}

PayoutKycNotice.propTypes = {
	className: PropTypes.string,
};

export default PayoutKycNotice;
