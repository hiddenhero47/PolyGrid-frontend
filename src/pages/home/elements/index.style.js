import styled from 'styled-components';

export const Swatch = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 10px;
	border-radius: 10px;
	background-color: ${({ theme }) => theme.surface.card};
	border: 1px solid ${({ theme }) => theme.border.default};

	.swatch-chip {
		height: 44px;
		border-radius: 6px;
		border: 1px solid ${({ theme }) => theme.border.default};
	}

	.swatch-name {
		font-size: 13px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.swatch-value {
		font-size: 11px;
		font-family: ui-monospace, monospace;
		color: ${({ theme }) => theme.text.secondary};
		word-break: break-all;
	}
`;

export const AccentButton = styled.button`
	padding: 8px 16px;
	border-radius: 8px;
	font-weight: 600;
	border: 1px solid
		${({ theme, $active }) => ($active ? theme.accent.default : theme.border.strong)};
	background-color: ${({ theme, $active }) =>
		$active ? theme.accent.default : 'transparent'};
	color: ${({ theme, $active }) =>
		$active ? theme.text.onAccent : theme.text.primary};

	&:hover {
		background-color: ${({ theme, $active }) =>
			$active ? theme.accent.emphasis : theme.state.hover};
	}
`;
