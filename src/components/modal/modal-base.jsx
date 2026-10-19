import React, { useId, useImperativeHandle, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { ModalContext } from './modal-context';
import { ModalDialog } from './index_modal.style';

// HM's modal API (refName.current.open() / .close(), onOpen, onClose),
// rebuilt on dialog.showModal() instead of <dialog open={state}>. The
// browser now does, natively:
//   - top layer (no z-index fights) and an inert page behind it
//   - focus moves in, stays trapped, and returns to the opener on close
//   - Escape closes it (the `cancel` event)
// Page scroll is locked by one CSS rule in global.style.js
// (html:has(dialog[open])). Nothing here is a useEffect.
function ModalBase({
	refName,
	position = 'center',
	onOpen,
	onClose,
	width,
	height,
	maxWidth,
	minWidth,
	queryWidth,
	mediaQuery,
	marginOffset,
	borderPaddingY,
	animation = true,
	dismissible = true,
	ariaLabel,
	children,
}) {
	const dialogRef = useRef(null);
	const pressStartedOnBackdrop = useRef(false);
	const titleId = useId();

	const open = () => {
		const dialog = dialogRef.current;
		if (!dialog || dialog.open) return;
		dialog.showModal();
		onOpen?.();
	};

	const close = () => {
		// the `close` event below calls onClose — Escape takes the same path
		dialogRef.current?.close();
	};

	useImperativeHandle(refName, () => ({
		open,
		close,
		isOpen: () => Boolean(dialogRef.current?.open),
	}));

	// Close on a click on the backdrop — but only if the press also started
	// there, so dragging a text selection out of the panel doesn't close it.
	const handlePointerDown = (e) => {
		pressStartedOnBackdrop.current = e.target === e.currentTarget;
	};

	const handleClick = (e) => {
		if (
			dismissible &&
			pressStartedOnBackdrop.current &&
			e.target === e.currentTarget
		) {
			close();
		}
	};

	// Escape: allowed only when dismissible
	const handleCancel = (e) => {
		if (!dismissible) e.preventDefault();
	};

	const context = useMemo(
		() => ({ titleId, position, close }),
		// close only touches the ref, so it never goes stale
		[titleId, position]
	);

	return (
		<ModalDialog
			ref={dialogRef}
			onPointerDown={handlePointerDown}
			onClick={handleClick}
			onCancel={handleCancel}
			onClose={() => onClose?.()}
			aria-labelledby={ariaLabel ? undefined : titleId}
			aria-label={ariaLabel}
			$position={position}
			$width={width}
			$height={height}
			$maxWidth={maxWidth}
			$minWidth={minWidth}
			$queryWidth={queryWidth}
			$mediaQuery={mediaQuery}
			$marginOffset={marginOffset}
			$borderPaddingY={borderPaddingY}
			$animation={animation}
		>
			<div className="sc_panel">
				<ModalContext.Provider value={context}>
					{children}
				</ModalContext.Provider>
			</div>
		</ModalDialog>
	);
}

ModalBase.propTypes = {
	refName: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.shape({ current: PropTypes.any }),
	]),
	position: PropTypes.oneOf(['center', 'left', 'right', 'bottom']),
	onOpen: PropTypes.func,
	onClose: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
	maxWidth: PropTypes.string,
	minWidth: PropTypes.string,
	queryWidth: PropTypes.string,
	mediaQuery: PropTypes.string,
	marginOffset: PropTypes.string,
	borderPaddingY: PropTypes.string,
	animation: PropTypes.bool,
	dismissible: PropTypes.bool,
	ariaLabel: PropTypes.string,
	children: PropTypes.node,
};

export default ModalBase;
