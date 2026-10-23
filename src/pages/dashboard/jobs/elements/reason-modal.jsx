import React, { useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/modal/index_modal';
import { AppButton } from '../../../../components/button';
import { CustomTextarea } from '../../../../components/form-components';

// A short "why" for a job action — dispute, refund, payout — as a promise:
//   const text = await ref.current.ask({ title, text, label, required, confirmLabel });
//   if (text === null) return; // cancelled
function ReasonModal({ refName }) {
	const modalRef = useRef(null);
	const resolver = useRef(null);
	const [opts, setOpts] = useState({});
	const [value, setValue] = useState('');
	const [error, setError] = useState('');

	const settle = (answer) => {
		const resolve = resolver.current;
		resolver.current = null;
		resolve?.(answer);
	};

	useImperativeHandle(refName, () => ({
		ask: (next = {}) =>
			new Promise((resolve) => {
				settle(null);
				resolver.current = resolve;
				setOpts(next);
				setValue('');
				setError('');
				modalRef.current.open();
			}),
	}));

	const submit = (e) => {
		e.preventDefault();
		if (opts.required && value.trim().length < 5) {
			setError('Add a few words so the other side (and our team) understand');
			return;
		}
		settle(value.trim());
		modalRef.current.close();
	};

	return (
		<Modal.Center
			refName={modalRef}
			width="520px"
			queryWidth="100%"
			onClose={() => settle(null)}
		>
			<Modal.Card
				eyebrow={opts.eyebrow || 'Job'}
				title={opts.title}
				subtitle={opts.text}
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => modalRef.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton type="submit" form="job-reason-form">
							{opts.confirmLabel || 'Send'}
						</AppButton>
					</>
				}
			>
				<form id="job-reason-form" noValidate onSubmit={submit}>
					<CustomTextarea
						label={opts.label || 'Reason'}
						name="reason"
						required={opts.required}
						minHeight="120px"
						maxLength={1000}
						value={value}
						onChange={(e) => {
							setValue(e.target.value);
							setError('');
						}}
						isError={Boolean(error)}
						errormessage={error}
					/>
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

ReasonModal.propTypes = { refName: PropTypes.object.isRequired };

export default ReasonModal;
