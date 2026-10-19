import styled from 'styled-components';

export const ProfileHeader = styled.section`
	position: relative;
	overflow: hidden;
	border-bottom: 1px solid ${({ theme }) => theme.card.border};

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse 60% 100% at 0% 0%,
			${({ theme }) => theme.hero.glow},
			transparent 70%
		);
	}

	.sc_headline {
		font-family: var(--font-display);
		font-size: clamp(34px, 4.6vw, 54px);
		font-weight: 700;
		line-height: 1.02;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 20px;
		font-size: 15px;
		color: ${({ theme }) => theme.text.secondary};
	}
`;

// A titled panel on the profile page
export const ProfileSection = styled.section`
	padding: 26px;
	border-radius: 18px;
	border: 1px solid ${({ theme }) => theme.card.border};
	background-color: ${({ theme }) => theme.card.background};

	.sc_sectionTitle {
		margin-bottom: 18px;
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_prose {
		font-size: 16px;
		line-height: 1.7;
		color: ${({ theme }) => theme.text.secondary};
		white-space: pre-line;
	}
`;

export const ServiceItem = styled.li`
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 16px 0;
	border-bottom: 1px solid ${({ theme }) => theme.card.border};

	&:first-child {
		padding-top: 0;
	}

	&:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.sc_name {
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_price {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};

		span {
			margin-left: 4px;
			font-family: var(--font-sans);
			font-size: 13px;
			font-weight: 400;
			color: ${({ theme }) => theme.text.secondary};
		}
	}

	.sc_desc {
		font-size: 14px;
		line-height: 1.55;
		color: ${({ theme }) => theme.text.secondary};
	}
`;

export const PortfolioTile = styled.button`
	position: relative;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	text-align: left;
	border-radius: 14px;
	border: 1px solid ${({ theme }) => theme.card.border};
	background-color: ${({ theme }) => theme.surface.sunken};
	transition: border-color 0.2s ease;

	&:hover {
		border-color: ${({ theme }) => theme.card.borderHover};
	}

	.sc_media {
		position: relative;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: ${({ theme }) => theme.icon.background};
		color: ${({ theme }) => theme.icon.color};
		font-size: 30px;

		img {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.6s ease;
		}
	}

	&:hover img {
		transform: scale(1.04);
	}

	.sc_body {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px;
	}

	.sc_title {
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_dates {
		font-size: 13px;
		color: ${({ theme }) => theme.text.secondary};
	}
`;
