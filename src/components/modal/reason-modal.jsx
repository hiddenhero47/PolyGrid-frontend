import React, { useId, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './index_modal';
import { AppButton } from '../button';
import { CustomTextarea } from '../form-components';

// A short "why" as a promise — a dispute, refund or payout note, a
// message report, an admin's decline reason or resolution note:
//   const text = await ref.current.ask({ title, text, label, required, confirmLabel });
//   if (text === null) return; // cancelled
function ReasonModal({ refName }) {
	const modalRef = useRef(null);
	const formId = useId();
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
				eyebrow={opts.eyebrow}
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
						<AppButton type="submit" form={formId}>
							{opts.confirmLabel || 'Send'}
						</AppButton>
					</>
				}
			>
				<form id={formId} noValidate onSubmit={submit}>
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
