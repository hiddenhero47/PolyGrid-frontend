import React from 'react';
import PropTypes from 'prop-types';
import { LuX } from 'react-icons/lu';
import { useModal } from './modal-context';
import { CardShell } from './index_modal.style';

const RADIUS = {
	center: '16px',
	left: '0 16px 16px 0',
	right: '16px 0 0 16px',
	bottom: '18px 18px 0 0',
};

// The standard look for modal content — use it inside any Modal.* so every
// modal shares one header / body / footer. It reads the modal's position
// and close() from context, so no refs or onClose need passing in.
function ModalCard({
	eyebrow,
	title,
	subtitle,
	footer,
	showClose = true,
	children,
	className,
}) {
	const { titleId, position, close } = useModal();
	const isSheet = position === 'bottom';
	const isDrawer = position === 'left' || position === 'right';

	return (
		<CardShell
			$radius={RADIUS[position]}
			$fill={isDrawer}
			className={className}
		>
			{isSheet && <span className="sc_handle" aria-hidden="true" />}

			{(title || showClose) && (
				<header className="sc_header">
					<div>
						{eyebrow && <p className="sc_eyebrow">{eyebrow}</p>}
						{title && (
							<h2 id={titleId} className="sc_title">
								{title}
							</h2>
						)}
						{subtitle && <p className="sc_subtitle">{subtitle}</p>}
					</div>
					{showClose && (
						<button
							type="button"
							className="sc_close"
							onClick={close}
							aria-label="Close"
						>
							<LuX />
						</button>
					)}
				</header>
			)}

			<div className="sc_body">{children}</div>

			{footer && <footer className="sc_footer">{footer}</footer>}
		</CardShell>
	);
}

ModalCard.propTypes = {
	eyebrow: PropTypes.node,
	title: PropTypes.node,
	subtitle: PropTypes.node,
	footer: PropTypes.node,
	showClose: PropTypes.bool,
	children: PropTypes.node,
	className: PropTypes.string,
};

export default ModalCard;
