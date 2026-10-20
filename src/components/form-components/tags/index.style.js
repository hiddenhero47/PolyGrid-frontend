import styled from 'styled-components';
import { fieldShell } from '../field/index.style';

export const TagsShell = styled.div`
	${fieldShell};
	flex-wrap: wrap;
	gap: 6px;
	padding-block: 7px;

	input {
		flex: 1;
		min-width: 120px;
		height: 30px;
		border: 0;
		outline: 0;
		background: transparent;
		color: inherit;
		font: inherit;

		&::placeholder {
			color: ${({ theme }) => theme.form.placeholder};
		}
	}

	.sc_tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 28px;
		padding: 0 6px 0 10px;
		border: 1px solid ${({ theme }) => theme.chip.border};
		border-radius: 8px;
		background-color: ${({ theme }) => theme.chip.background};
		font-size: 13.5px;
		color: ${({ theme }) => theme.chip.text};

		button {
			display: inline-flex;
			padding: 3px;
			border-radius: 6px;
			color: ${({ theme }) => theme.text.secondary};

			&:hover {
				background-color: ${({ theme }) => theme.state.hover};
				color: ${({ theme }) => theme.form.error};
			}
		}
	}
`;
