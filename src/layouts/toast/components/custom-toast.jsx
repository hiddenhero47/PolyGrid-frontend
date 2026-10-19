import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
	LuCircleCheck,
	LuCircleAlert,
	LuInfo,
	LuTriangleAlert,
	LuX,
} from 'react-icons/lu';

// HM's CustomToast idea: react-toastify only positions and times the
// toast; this is what it looks like. Colors from the theme's status tokens.

const ICONS = {
	success: <LuCircleCheck />,
	error: <LuCircleAlert />,
	warning: <LuTriangleAlert />,
	info: <LuInfo />,
};

const TITLES = {
	success: 'Done',
	error: 'Something went wrong',
	warning: 'Heads up',
	info: 'Note',
};

const Body = styled.div`
	position: relative;
	display: flex;
	align-items: flex-start;
	gap: 12px;
	width: min(380px, calc(100vw - 32px));
	padding: 14px 14px 14px 18px;
	overflow: hidden;
	border-radius: 12px;
	border: 1px solid ${({ theme }) => theme.card.border};
	background-color: ${({ theme }) => theme.surface.elevated};
	box-shadow: 0 18px 40px -16px rgba(0, 0, 0, 0.4);
	font-family: var(--font-sans);

	/* type stripe on the left edge */
	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background-color: ${({ theme, $type }) => theme.status[$type]};
	}

	.sc_icon {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 9px;
		font-size: 17px;
		background-color: ${({ theme, $type }) => theme.status[`${$type}Soft`]};
		color: ${({ theme, $type }) => theme.status[$type]};
	}

	.sc_text {
		flex: 1;
		min-width: 0;
		padding-top: 1px;
	}

	.sc_title {
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: ${({ theme, $type }) => theme.status[$type]};
	}

	.sc_message {
		margin-top: 2px;
		font-size: 14px;
		line-height: 1.45;
		color: ${({ theme }) => theme.text.primary};
		overflow-wrap: anywhere;
	}

	.sc_action {
		margin-top: 8px;
		font-size: 13px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.link};

		&:hover {
			text-decoration: underline;
		}
	}

	.sc_close {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		margin: -2px -2px 0 0;
		border-radius: 7px;
		font-size: 16px;
		color: ${({ theme }) => theme.text.secondary};

		&:hover {
			background-color: ${({ theme }) => theme.state.hover};
			color: ${({ theme }) => theme.text.primary};
		}
	}
`;

function CustomToast({
	type = 'info',
	title,
	message,
	actionText,
	onAction,
	closeToast,
}) {
	return (
		<Body $type={type} role={type === 'error' ? 'alert' : 'status'}>
			<span className="sc_icon" aria-hidden="true">
				{ICONS[type]}
			</span>
			<div className="sc_text">
				<p className="sc_title">{title || TITLES[type]}</p>
				<p className="sc_message">{message}</p>
				{actionText && onAction && (
					<button
						type="button"
						className="sc_action"
						onClick={() => {
							onAction();
							closeToast?.();
						}}
					>
						{actionText}
					</button>
				)}
			</div>
			<button
				type="button"
				className="sc_close"
				onClick={closeToast}
				aria-label="Dismiss"
			>
				<LuX />
			</button>
		</Body>
	);
}

CustomToast.propTypes = {
	type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
	title: PropTypes.node,
	message: PropTypes.node,
	actionText: PropTypes.node,
	onAction: PropTypes.func,
	closeToast: PropTypes.func,
};

export default CustomToast;
