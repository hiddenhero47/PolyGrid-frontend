import React from 'react';
import PropTypes from 'prop-types';
import { LuShieldCheck } from 'react-icons/lu';
import { formatDate, formatMoney } from '../../utilities/basic-functions';

// A card payment that went through but isn't delivered yet: above the
// admin's hold amount the value waits out a security check, and a dispute
// stops it. `unlocks` says what's waiting: "your plan starts".
function PaymentHoldNotice({ payment, unlocks }) {
	const amount = formatMoney(payment.amount, payment.currency);
	const release = new Date(payment.holdReleaseAt);
	const when =
		release > new Date() ? `, usually by ${formatDate(release, true)}` : '';

	return (
		<p
			role="status"
			className="mb-4 flex items-start gap-3 rounded-xl bg-(--pg-status-infoSoft) px-4 py-3 text-[15px] text-(--pg-text-primary)"
		>
			<LuShieldCheck
				aria-hidden="true"
				className="mt-0.5 shrink-0 text-(--pg-status-info)"
			/>
			<span>
				{payment.status === 'disputed'
					? `Your ${amount} payment is in dispute with your card issuer, so ${unlocks} only once that’s settled.`
					: `We’ve received your ${amount} payment. ${unlocks[0].toUpperCase()}${unlocks.slice(1)} after a routine security check${when}. We’ll email you when it clears.`}
			</span>
		</p>
	);
}

PaymentHoldNotice.propTypes = {
	payment: PropTypes.object.isRequired,
	unlocks: PropTypes.string.isRequired,
};

export default PaymentHoldNotice;
