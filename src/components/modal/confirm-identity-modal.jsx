import React, { useId, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { LuShieldCheck } from 'react-icons/lu';
import ModalBase from './modal-base';
import ModalCard from './modal-card';
import { AppButton } from '../button';
import { CustomPassword, CustomOtp } from '../form-components';

// frontend-plan §2's "confirm with password or 2FA" pattern — one modal
// for every sensitive change (payout account, 2FA). Asks for the 2FA code
// when the account has 2FA on, otherwise the current password — exactly
// what polygrid-backend's verifyIdentity middleware checks.
//   const identity = await idRef.current.ask({ action: 'update your payout account' });
//   if (!identity) return;            // cancelled
//   mutate({ ...fields, ...identity }); // { currentPassword } | { otpToken }
function ConfirmIdentityModal({ refName }) {
	const { user } = useSelector((state) => state.auth);
	const usesOtp = Boolean(user?.user2fa?.enable);
	const formId = useId(); // a page may hold several of these
	const modalRef = useRef(null);
	const resolver = useRef(null);
	const [action, setAction] = useState('');
	const [value, setValue] = useState('');
	const [error, setError] = useState('');

	const settle = (answer) => {
		const resolve = resolver.current;
		resolver.current = null;
		resolve?.(answer);
	};

	useImperativeHandle(refName, () => ({
		ask: ({ action: next = 'continue' } = {}) =>
			new Promise((resolve) => {
				settle(null);
				resolver.current = resolve;
				setAction(next);
				setValue('');
				setError('');
				modalRef.current.open();
			}),
	}));

	const submit = (e) => {
		e?.preventDefault();
		if (usesOtp ? !/^\d{6}$/.test(value) : !value) {
			setError(
				usesOtp ? 'Enter the 6-digit code' : 'Enter your current password'
			);
			return;
		}
		settle(usesOtp ? { otpToken: value } : { currentPassword: value });
		modalRef.current.close();
	};

	return (
		<ModalBase
			position="center"
			refName={modalRef}
			width="440px"
			queryWidth="100%"
			onClose={() => settle(null)}
		>
			<ModalCard
				eyebrow="Security check"
				title="Confirm it’s you"
				subtitle={`To ${action}, ${usesOtp ? 'enter the code from your authenticator app' : 'enter your current password'}.`}
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => modalRef.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton type="submit" form={formId} icon={<LuShieldCheck />}>
							Confirm
						</AppButton>
					</>
				}
			>
				<form id={formId} noValidate onSubmit={submit}>
					{usesOtp ? (
						<CustomOtp
							label="Authentication code"
							name="otpToken"
							value={value}
							onChange={(next) => {
								setValue(next);
								setError('');
							}}
							onComplete={() => {}}
							isError={Boolean(error)}
							errormessage={error}
						/>
					) : (
						<CustomPassword
							label="Current password"
							name="currentPassword"
							autoComplete="current-password"
							value={value}
							onChange={(e) => {
								setValue(e.target.value);
								setError('');
							}}
							isError={Boolean(error)}
							errormessage={error}
						/>
					)}
				</form>
			</ModalCard>
		</ModalBase>
	);
}

ConfirmIdentityModal.propTypes = {
	refName: PropTypes.object.isRequired,
};

export default ConfirmIdentityModal;
