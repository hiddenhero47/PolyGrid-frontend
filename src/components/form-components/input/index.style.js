import styled from 'styled-components';
import { fieldShell } from '../field/index.style';

export const InputShell = styled.div`
	${fieldShell}

	/* number inputs: no spinner arrows */
	.sc_control::-webkit-inner-spin-button,
	.sc_control::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.sc_reveal {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		margin-right: -6px;
		border-radius: 6px;
		font-size: 18px;
		color: ${({ theme }) => theme.form.placeholder};
		transition: color 0.15s ease;

		&:hover {
			color: ${({ theme }) => theme.form.text};
		}

		&:disabled {
			pointer-events: none;
		}
	}
`;

export const TextareaShell = styled.div`
	${fieldShell}
	flex-direction: column;
	align-items: stretch;
	padding-block: 12px;

	.sc_control {
		min-height: ${({ $minHeight }) => $minHeight || '96px'};
		max-height: ${({ $maxHeight }) => $maxHeight || '280px'};
		resize: vertical;
		line-height: 1.5;
	}

	.sc_count {
		align-self: flex-end;
		font-size: 12px;
		color: ${({ theme }) => theme.form.hint};
	}
`;
