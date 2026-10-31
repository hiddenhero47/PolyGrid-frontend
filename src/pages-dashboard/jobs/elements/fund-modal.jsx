import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../components/modal/index_modal';
import { AppButton } from '../../../components/button';
import { CustomInput } from '../../../components/form-components';
import { formatMoney } from '../../../utilities/basic-functions';

// How much to put into escrow now (up to what's still unfunded); then
// Stripe's card form takes over.
function FundModal({ refName, remaining, currency, onContinue, isPending }) {
	const [amount, setAmount] = useState('');
	const [error, setError] = useState('');

	const submit = (e) => {
		e.preventDefault();
		const value = Number(amount);
		if (!(value > 0)) return setError('Enter an amount');
		if (value > remaining)
			return setError(
				`At most ${formatMoney(remaining, currency)} is left to fund`
			);
		setError('');
		onContinue(Math.round(value * 100) / 100);
	};

	return (
		<Modal.Center
			refName={refName}
			width="460px"
			queryWidth="100%"
			onOpen={() => {
				setAmount(String(remaining));
				setError('');
			}}
		>
			<Modal.Card
				eyebrow="Escrow"
				title="Fund this job"
				subtitle={`Money is held by PolyGrid and released to the provider stage by stage, as you verify each one. ${formatMoney(remaining, currency)} is still unfunded.`}
				footer={
					<AppButton type="submit" form="fund-form" disabled={isPending}>
						{isPending ? 'Starting…' : 'Continue to payment'}
					</AppButton>
				}
			>
				<form id="fund-form" noValidate onSubmit={submit}>
					<CustomInput
						label="Amount (USD)"
						name="amount"
						type="number"
						inputMode="decimal"
						min="0"
						step="0.01"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						isError={Boolean(error)}
						errormessage={error}
					/>
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

FundModal.propTypes = {
	refName: PropTypes.object.isRequired,
	remaining: PropTypes.number.isRequired,
	currency: PropTypes.string,
	onContinue: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default FundModal;
