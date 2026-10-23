import styled from 'styled-components';

// A row in an editor list (services, links, portfolio items).
export const ListRow = styled.li`
	display: flex;
	align-items: flex-start;
	gap: 14px;
	padding: 16px 18px;
	border: 1px solid ${({ theme }) => theme.card.border};
	border-radius: 14px;
	background-color: ${({ theme }) => theme.surface.background};

	.sc_rowTitle {
		font-size: 16px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_rowMeta {
		margin-top: 3px;
		font-size: 14px;
		color: ${({ theme }) => theme.text.secondary};

		strong {
			color: ${({ theme }) => theme.text.primary};
		}
	}

	.sc_rowText {
		margin-top: 8px;
		font-size: 14.5px;
		line-height: 1.55;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_iconAction {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		font-size: 16px;
		color: ${({ theme }) => theme.text.secondary};
		transition:
			background-color 0.18s ease,
			color 0.18s ease;

		&:hover:not(:disabled) {
			background-color: ${({ theme }) => theme.state.hover};
			color: ${({ theme }) => theme.text.primary};
		}

		&[data-tone='danger']:hover:not(:disabled) {
			color: ${({ theme }) => theme.status.error};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.border.focus};
		}

		&:disabled {
			opacity: 0.5;
		}
	}
`;

// The profile header: avatar, name, state, public link, status switch.
export const EditorHeader = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 18px 24px;
	margin-bottom: 24px;

	.sc_avatarWrap {
		position: relative;
		flex-shrink: 0;
	}

	.sc_avatarBtn {
		position: absolute;
		right: -8px;
		bottom: -8px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border: 2px solid ${({ theme }) => theme.surface.card};
		border-radius: 50%;
		font-size: 15px;
		background-color: ${({ theme }) => theme.button.primaryBg};
		color: ${({ theme }) => theme.button.primaryText};
		cursor: pointer;

		&:focus-within {
			outline: 2px solid ${({ theme }) => theme.border.focus};
			outline-offset: 2px;
		}

		input {
			position: absolute;
			width: 1px;
			height: 1px;
			opacity: 0;
		}
	}

	.sc_name {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}
`;
