import styled from 'styled-components';

export const AuthWrapper = styled.div`
	display: grid;
	min-height: 100vh;
	width: 100%;
	background-color: ${({ theme }) => theme.surface.background};

	@media (min-width: 1024px) {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}

	/* brand panel (desktop only — on phones the form is the whole page) */
	.sc_brand {
		position: relative;
		display: none;
		overflow: hidden;
		margin: 16px;
		border-radius: 20px;

		@media (min-width: 1024px) {
			display: block;
			position: sticky;
			top: 16px;
			height: calc(100vh - 32px);
		}

		img {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: ${({ theme }) => theme.hero.imageOverlay};
		}
	}

	.sc_brandContent {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		height: 100%;
		padding: 36px;
	}

	.sc_quote {
		max-width: 460px;
		font-family: var(--font-display);
		font-size: clamp(32px, 3.2vw, 46px);
		font-weight: 600;
		line-height: 1.04;
		text-transform: uppercase;
		color: ${({ theme }) => theme.glass.text};

		span {
			color: ${({ theme }) => theme.accent.default};
		}
	}

	.sc_pillars {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 22px;
	}

	.sc_pillar {
		padding: 7px 12px;
		border-radius: 999px;
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		background-color: ${({ theme }) => theme.glass.background};
		border: 1px solid ${({ theme }) => theme.glass.border};
		color: ${({ theme }) => theme.glass.text};
		backdrop-filter: blur(8px);
	}

	/* form side */
	.sc_main {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding: 20px 16px 32px;

		@media (min-width: 640px) {
			padding: 28px 40px 40px;
		}
	}

	.sc_topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.sc_iconBtn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		font-size: 19px;
		color: ${({ theme }) => theme.navbar.link};

		&:hover {
			color: ${({ theme }) => theme.navbar.linkHover};
			background-color: ${({ theme }) => theme.state.hover};
		}
	}

	.sc_form {
		width: 100%;
		max-width: 440px;
		margin: auto;
		padding-block: 40px;
	}
`;
