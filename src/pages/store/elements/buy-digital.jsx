import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { LuDownload, LuShoppingBag } from 'react-icons/lu';
import PurchaseServices from '../../../features/services/custom-hooks/purchases';
import PaymentServices from '../../../features/services/custom-hooks/payments';
import { toast } from '../../../layouts/toast/toast-handler';
import CheckoutModal from '../../../components/checkout-modal';
import { AppButton } from '../../../components/button';
import { formatMoney } from '../../../utilities/basic-functions';
import { ROUTES } from '../../../utilities/app-routes';
import { idOf } from '../../dashboard/elements/listing-helpers';

// "Buy" on a digital file (frontend-plan §B.14): Stripe straight away,
// no job or escrow. If you already own it (or a purchase is pending),
// it links to your purchases instead.
function BuyDigital({ product }) {
	const navigate = useNavigate();
	const checkoutRef = useRef(null);
	const [checkout, setCheckout] = useState(null); // { clientSecret, paymentId }
	const purchases = PurchaseServices.mine({ page: 1, limit: 100 });
	const refreshPurchases = PurchaseServices.useRefresh();
	const buy = PurchaseServices.buy();
	const refreshPayment = PaymentServices.refresh();
	const owned = (purchases.data?.data || []).find(
		(p) => idOf(p.product) === product.id
	);
	const purchasesTo = `${ROUTES.DASHBOARD_PURCHASES}`;

	if (owned)
		return (
			<AppButton to={purchasesTo} icon={<LuDownload />}>
				{owned.status === 'success'
					? 'You own this — download'
					: 'Purchase pending — view'}
			</AppButton>
		);

	const start = () =>
		buy.mutate(product.id, {
			onSuccess: (res) => {
				if (!res.clientSecret) {
					refreshPurchases();
					toast.success('It’s yours — find it in Purchases');
					navigate(purchasesTo);
					return;
				}
				setCheckout({
					clientSecret: res.clientSecret,
					paymentId: res.paymentId,
				});
				checkoutRef.current.open();
			},
		});

	// card accepted — ask the backend to check with Stripe now rather than
	// wait for the webhook, then go to the downloads
	const paid = () => {
		checkoutRef.current.close();
		toast.success('Paid — preparing your download');
		refreshPayment.mutate(checkout.paymentId, {
			onSettled: () => {
				refreshPurchases();
				navigate(purchasesTo);
			},
		});
	};

	return (
		<>
			<AppButton
				icon={<LuShoppingBag />}
				onClick={start}
				disabled={buy.isPending || purchases.isPending}
			>
				{buy.isPending
					? 'Starting…'
					: `Buy · ${product.price === 0 ? 'Free' : formatMoney(product.price, product.currency)}`}
			</AppButton>
			<CheckoutModal
				refName={checkoutRef}
				summary={
					checkout && {
						eyebrow: 'Digital file',
						title: product.title,
						subtitle:
							'Paid straight to the creator through PolyGrid. Your copy is yours to download from Purchases.',
						amount: product.price,
						currency: product.currency,
					}
				}
				clientSecret={checkout?.clientSecret}
				onPaid={paid}
			/>
		</>
	);
}

BuyDigital.propTypes = { product: PropTypes.object.isRequired };

export default BuyDigital;
