import React, { useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ModalBase from './modal-base';
import ModalCard from './modal-card';
import { AppButton } from '../button';

// "Are you sure?" as a promise, on the same dialog as every other modal:
//   const confirmRef = useRef(null);
//   if (!(await confirmRef.current.ask({ title, text, confirmLabel }))) return;
//   …
//   <ConfirmModal refName={confirmRef} />
// Resolves true on confirm; false on cancel, Escape or a backdrop click.
function ConfirmModal({ refName }) {
	const modalRef = useRef(null);
	const resolver = useRef(null);
	const [options, setOptions] = useState({});

	const settle = (answer) => {
		const resolve = resolver.current;
		resolver.current = null;
		resolve?.(answer);
	};

	useImperativeHandle(refName, () => ({
		ask: (next = {}) =>
			new Promise((resolve) => {
				settle(false); // a question still open is answered "no"
				resolver.current = resolve;
				setOptions(next);
				modalRef.current.open();
			}),
	}));

	return (
		<ModalBase
			position="center"
			refName={modalRef}
			width="460px"
			queryWidth="100%"
			onClose={() => settle(false)}
		>
			<ModalCard
				eyebrow={options.eyebrow || 'Please confirm'}
				title={options.title || 'Are you sure?'}
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => modalRef.current.close()}
						>
							{options.cancelLabel || 'Cancel'}
						</AppButton>
						<AppButton
							onClick={() => {
								settle(true);
								modalRef.current.close();
							}}
						>
							{options.confirmLabel || 'Confirm'}
						</AppButton>
					</>
				}
			>
				{options.text && (
					<p className="text-[15px] leading-relaxed text-(--pg-text-secondary)">
						{options.text}
					</p>
				)}
			</ModalCard>
		</ModalBase>
	);
}

ConfirmModal.propTypes = {
	refName: PropTypes.object.isRequired,
};

export default ConfirmModal;
