import styled from 'styled-components';

// Shared by the workspace pages.

export const GoLiveStrip = styled.section`
	display: flex;
	flex-direction: column;
	gap: 14px;
	padding: 18px;
	border: 1px solid ${({ theme }) => theme.card.border};
	border-radius: 16px;
	background-color: ${({ theme }) => theme.surface.background};

	.sc_head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 12px;
	}

	.sc_title {
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_sub {
		font-size: 14px;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_steps {
		display: grid;
		gap: 10px;

		@media (min-width: 640px) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		@media (min-width: 1280px) {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.sc_step {
		display: flex;
		align-items: center;
		gap: 12px;
		height: 100%;
		padding: 12px 14px;
		border: 1px solid ${({ theme }) => theme.card.border};
		border-radius: 12px;
		background-color: ${({ theme }) => theme.surface.card};
		transition: border-color 0.18s ease;

		&:hover {
			border-color: ${({ theme }) => theme.card.borderHover};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.border.focus};
			outline-offset: 2px;
		}
	}

	.sc_stepIcon {
		flex-shrink: 0;
		font-size: 22px;
		color: ${({ theme }) => theme.text.secondary};
	}

	[data-status='done'] .sc_stepIcon {
		color: ${({ theme }) => theme.status.success};
	}
	[data-status='waiting'] .sc_stepIcon {
		color: ${({ theme }) => theme.status.warning};
	}
	[data-status='failed'] .sc_stepIcon {
		color: ${({ theme }) => theme.status.error};
	}

	.sc_stepLabel {
		display: block;
		font-size: 14.5px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_stepNote {
		display: block;
		font-size: 13px;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_go {
		margin-left: auto;
		flex-shrink: 0;
		color: ${({ theme }) => theme.text.link};
	}
`;

// A profile type in the hub — existing or "create".
export const ProfileTypeCard = styled.article`
	display: flex;
	flex-direction: column;
	gap: 14px;
	padding: 20px;
	border: 1px ${({ $empty }) => ($empty ? 'dashed' : 'solid')}
		${({ theme }) => theme.card.border};
	border-radius: 18px;
	background-color: ${({ theme }) => theme.surface.background};

	.sc_typeIcon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		font-size: 21px;
		background-color: ${({ theme }) => theme.icon.accentBackground};
		color: ${({ theme }) => theme.icon.accentColor};
	}

	.sc_pillar {
		font-family: var(--font-label);
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.highlight};
	}

	.sc_typeName {
		margin-top: 2px;
		font-size: 17px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_pitch {
		flex: 1;
		font-size: 14.5px;
		line-height: 1.55;
		color: ${({ theme }) => theme.text.secondary};
	}
`;
