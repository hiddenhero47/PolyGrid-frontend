import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
	Elements,
	PaymentElement,
	useElements,
	useStripe,
} from '@stripe/react-stripe-js';
import { LuLock } from 'react-icons/lu';
import { getStripe } from '../../../../features/services/stripe';
import Modal from '../../../../components/modal/index_modal';
import { AppButton } from '../../../../components/button';
import { THEMES } from '../../../../theme';
import { formatMoney, humanize } from '../../../../utilities/basic-functions';

// Stripe's own form, colored from the active theme's raw hex tokens
// (Stripe can't read CSS variables).
const appearanceFor = (themeName) => {
	const t = THEMES[themeName].tokens;
	return {
		theme: THEMES[themeName].mode === 'dark' ? 'night' : 'stripe',
		variables: {
			colorPrimary: t.accent.default,
			colorBackground: t.form.background,
			colorText: t.form.text,
			colorDanger: t.form.error,
			borderRadius: '8px',
			fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
		},
	};
};

function PayForm({ plan, onPaid }) {
	const stripe = useStripe();
	const elements = useElements();
	const [error, setError] = useState('');
	const [paying, setPaying] = useState(false);

	const pay = async (e) => {
		e.preventDefault();
		if (!stripe || !elements) return;
		setPaying(true);
		setError('');
		// No redirect for cards; 3-D Secure opens in Stripe's own frame.
		const { error: stripeError } = await stripe.confirmPayment({
			elements,
			redirect: 'if_required',
		});
		setPaying(false);
		if (stripeError) setError(stripeError.message || 'Payment failed');
		else onPaid();
	};

	return (
		<form onSubmit={pay} className="flex flex-col gap-5">
			<PaymentElement />
			{error && (
				<p role="alert" className="text-sm text-(--pg-form-error)">
					{error}
				</p>
			)}
			<AppButton type="submit" icon={<LuLock />} disabled={!stripe || paying}>
				{paying ? 'Paying…' : `Pay ${formatMoney(plan.price, plan.currency)}`}
			</AppButton>
			<p className="text-center text-xs text-(--pg-text-secondary)">
				Card details go straight to Stripe — PolyGrid never sees them.
			</p>
		</form>
	);
}

PayForm.propTypes = {
	plan: PropTypes.object.isRequired,
	onPaid: PropTypes.func.isRequired,
};

// Paid-plan checkout: the PaymentIntent's clientSecret from
// POST /api/payments/intent drives Stripe's Payment Element. Only this
// modal is wrapped in <Elements> (CLAUDE.md: never the whole app).
function CheckoutModal({ refName, plan, clientSecret, onPaid, onClose }) {
	const { theme } = useSelector((state) => state.themes);

	return (
		<Modal.Center
			refName={refName}
			width="520px"
			queryWidth="100%"
			onClose={onClose}
		>
			{plan && clientSecret && (
				<Modal.Card
					eyebrow="Checkout"
					title={`${humanize(plan.planTier)} plan`}
					subtitle={`${formatMoney(plan.price, plan.currency)} for ${plan.duration} days. Any unused days on your current plan carry over.`}
				>
					<Elements
						key={clientSecret}
						stripe={getStripe()}
						options={{ clientSecret, appearance: appearanceFor(theme) }}
					>
						<PayForm plan={plan} onPaid={onPaid} />
					</Elements>
				</Modal.Card>
			)}
		</Modal.Center>
	);
}

CheckoutModal.propTypes = {
	refName: PropTypes.object.isRequired,
	plan: PropTypes.object,
	clientSecret: PropTypes.string,
	onPaid: PropTypes.func.isRequired,
	onClose: PropTypes.func,
};

export default CheckoutModal;
