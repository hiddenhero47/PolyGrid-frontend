import { useNavigate } from 'react-router-dom';
import { toast } from '../../layouts/toast/toast-handler';
import { ROUTES } from '../../utilities/app-routes';

export const KYC_SETTINGS = `${ROUTES.DASHBOARD_SETTINGS}#payout-kyc-settings`;

// onError for anything that creates or confirms a job: creating one,
// confirming one, awarding a tender bid, accepting a SiteForce worker.
// The backend refuses all of these (400 PAYOUT_KYC_REQUIRED, a silent
// code) until the person acting has passed the payout identity check —
// clients too, so a refund can always reach them. Other errors already
// got the generic toast.
export const useHireGateError = () => {
	const navigate = useNavigate();
	return (error) => {
		if (error?.silentCode !== 'PAYOUT_KYC_REQUIRED') return;
		toast.warning(
			'Before you start a job on PolyGrid we confirm who you are, so a refund or payout always reaches the right person.',
			{
				title: 'Verify your identity first',
				actionText: 'Verify in Settings',
				onAction: () => navigate(KYC_SETTINGS),
			}
		);
	};
};
