import styled, { css } from 'styled-components';

// The drop zone is a <label> wrapping a visually hidden file input, so a
// click anywhere opens the native picker and keyboard focus lands on the
// real input (focus ring drawn on the zone via :focus-within).
export const DropZone = styled.label`
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	min-height: ${({ $compact }) => ($compact ? '96px' : '140px')};
	padding: 18px;
	border: 1.5px dashed ${({ theme }) => theme.form.border};
	border-radius: 12px;
	background-color: ${({ theme, $variant }) =>
		$variant === 'outline' ? 'transparent' : theme.form.background};
	text-align: center;
	cursor: pointer;
	transition:
		border-color 0.15s ease,
		background-color 0.15s ease;

	input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.sc_dropIcon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
		border-radius: 12px;
		font-size: 20px;
		background-color: ${({ theme }) => theme.icon.accentBackground};
		color: ${({ theme }) => theme.icon.accentColor};
	}

	.sc_dropTitle {
		font-size: 15px;
		font-weight: 600;
		color: ${({ theme }) => theme.form.text};

		span {
			color: ${({ theme }) => theme.text.link};
			text-decoration: underline;
		}
	}

	.sc_dropMeta {
		font-size: 13px;
		color: ${({ theme }) => theme.form.hint};
	}

	&:hover {
		border-color: ${({ theme }) => theme.form.borderHover};
	}

	&:focus-within {
		border-color: ${({ theme }) => theme.form.focus};
		box-shadow: 0 0 0 1px ${({ theme }) => theme.form.focus};
	}

	${({ $dragging }) =>
		$dragging &&
		css`
			&,
			&:hover {
				border-color: ${({ theme }) => theme.form.focus};
				background-color: ${({ theme }) => theme.accent.soft};
			}
		`}

	${({ $isError }) =>
		$isError &&
		css`
			&,
			&:hover {
				border-color: ${({ theme }) => theme.form.error};
			}
		`}

	${({ $disabled }) =>
		$disabled &&
		css`
			&,
			&:hover {
				cursor: not-allowed;
				border-color: ${({ theme }) => theme.form.disabledBorder};
				background-color: ${({ theme }) => theme.form.disabledBg};
				opacity: 0.7;
			}
		`}
`;

export const FileRow = styled.li`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 10px;
	border: 1px solid ${({ theme }) => theme.form.border};
	border-radius: 10px;
	background-color: ${({ theme }) => theme.form.background};

	.sc_thumb {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		overflow: hidden;
		border-radius: 8px;
		font-size: 18px;
		background-color: ${({ theme }) => theme.icon.background};
		color: ${({ theme }) => theme.icon.color};

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.sc_name {
		display: block;
		overflow: hidden;
		font-size: 14px;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: ${({ theme }) => theme.form.text};
	}

	.sc_size {
		font-size: 12.5px;
		color: ${({ theme }) => theme.form.hint};
	}

	.sc_remove {
		margin-left: auto;
		padding: 6px;
		border-radius: 8px;
		color: ${({ theme }) => theme.text.secondary};

		&:hover {
			background-color: ${({ theme }) => theme.state.hover};
			color: ${({ theme }) => theme.form.error};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.border.focus};
		}
	}
`;
