import styled from 'styled-components';

export const PortfolioCard = styled.button`
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border: 1px solid ${({ theme }) => theme.card.border};
	border-radius: 16px;
	background-color: ${({ theme }) => theme.surface.background};
	text-align: left;
	transition:
		border-color 0.2s ease,
		transform 0.2s ease;

	&:hover {
		border-color: ${({ theme }) => theme.card.borderHover};
		transform: translateY(-2px);
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}

	.sc_cover {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 10;
		font-size: 28px;
		background-color: ${({ theme }) => theme.surface.elevated};
		color: ${({ theme }) => theme.text.secondary};

		img {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.sc_count {
		position: absolute;
		right: 10px;
		bottom: 10px;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 8px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		background-color: ${({ theme }) => theme.glass.background};
		color: ${({ theme }) => theme.glass.text};
	}

	.sc_body {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px 16px 16px;
	}

	.sc_title {
		font-size: 15.5px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_dates {
		font-size: 13px;
		color: ${({ theme }) => theme.text.secondary};
	}

	@media (prefers-reduced-motion: reduce) {
		&:hover {
			transform: none;
		}
	}
`;

export const MediaGrid = styled.ul`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
	gap: 10px;

	li {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 12px;
		background-color: ${({ theme }) => theme.surface.elevated};
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	button {
		position: absolute;
		top: 6px;
		right: 6px;
		display: inline-flex;
		padding: 6px;
		border-radius: 8px;
		background-color: ${({ theme }) => theme.glass.background};
		color: ${({ theme }) => theme.glass.text};

		&:hover {
			color: ${({ theme }) => theme.status.error};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.border.focus};
		}
	}
`;
