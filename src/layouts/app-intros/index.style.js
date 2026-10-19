import styled, { css } from 'styled-components';

// Timeline (s): grid + glow 0–0.8 · logo halves lock 0.2–1.1 · divider
// 1.0–1.5 · wordmark 1.2–1.8 · pillar names 1.7–2.5 · lift-off at 3.0.
const OUTRO_DELAY = '3s';

export const IntroWrapper = styled.div`
	position: fixed;
	inset: 0;
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	background-color: ${({ theme }) => theme.intro.background};
	/* Skip swaps to a separately named copy: changing only the delay of a
	   running animation doesn't reliably restart it. */
	animation: ${({ $skip }) =>
		$skip
			? 'pgIntroOutNow 0.7s cubic-bezier(0.76, 0, 0.24, 1) forwards'
			: `pgIntroOut 0.9s cubic-bezier(0.76, 0, 0.24, 1) ${OUTRO_DELAY} forwards`};

	/* Blueprint grid, drifting slowly */
	.sc_grid {
		position: absolute;
		inset: -80px;
		background-image:
			linear-gradient(
				${({ theme }) => theme.intro.gridLine} 1px,
				transparent 1px
			),
			linear-gradient(
				90deg,
				${({ theme }) => theme.intro.gridLine} 1px,
				transparent 1px
			);
		background-size: 56px 56px;
		opacity: 0;
		animation:
			pgFadeIn 0.8s ease-out forwards,
			pgGridDrift 6s linear infinite;
		mask-image: radial-gradient(circle at center, black 20%, transparent 70%);
		-webkit-mask-image: radial-gradient(
			circle at center,
			black 20%,
			transparent 70%
		);
	}

	.sc_glow {
		position: absolute;
		width: min(70vw, 620px);
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			${({ theme }) => theme.intro.glow} 0%,
			transparent 65%
		);
		opacity: 0;
		animation: pgFadeIn 1.2s ease-out 0.3s forwards;
	}

	.sc_content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(18px, 3vw, 28px);
	}

	.sc_lockup {
		display: flex;
		align-items: center;
		gap: clamp(16px, 3vw, 28px);
	}

	/* The mark's two halves slide in from opposite sides and lock */
	.sc_mark {
		width: clamp(56px, 11vw, 96px);
		height: auto;
		overflow: visible;

		path[fill*='base'] {
			opacity: 0;
			animation: pgFromLeft 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
		}

		path[fill*='accent'] {
			opacity: 0;
			animation:
				pgFromRight 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards,
				pgPulse 1.6s ease-in-out 1.1s infinite alternate;
		}
	}

	.sc_divider {
		width: 2px;
		height: clamp(44px, 8vw, 72px);
		border-radius: 2px;
		background-color: ${({ theme }) => theme.intro.text};
		transform: scaleY(0);
		animation: pgGrowY 0.5s ease-out 1s forwards;
	}

	.sc_word {
		display: flex;
		overflow: hidden;
		font-family: var(--font-display);
		font-size: clamp(34px, 7.5vw, 68px);
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.intro.text};

		span {
			display: inline-block;
			transform: translateY(110%);
			animation: pgRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		}

		.sc_first {
			animation-delay: 1.2s;
		}

		.sc_second {
			color: ${({ theme }) => theme.intro.sbText};
			animation-delay: 1.35s;
		}
	}

	.sc_pillars {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 6px 14px;
		font-family: var(--font-label);
		font-size: clamp(10px, 1.6vw, 13px);
		font-weight: 600;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.intro.text};

		span {
			opacity: 0;
			animation: pgFadeUp 0.5s ease-out forwards;
		}

		.sc_dot {
			color: ${({ theme }) => theme.intro.sbText};
		}
	}

	/* Progress line, filling until lift-off */
	.sc_progress {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 2px;
		width: 100%;
		background-color: ${({ theme }) => theme.intro.sbText};
		transform: scaleX(0);
		transform-origin: left;
		animation: pgGrowX ${OUTRO_DELAY} linear forwards;
	}

	.sc_skip {
		position: absolute;
		right: clamp(16px, 4vw, 40px);
		bottom: clamp(20px, 4vw, 40px);
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.intro.text};
		opacity: 0.6;
		transition: opacity 0.2s ease;

		&:hover {
			opacity: 1;
		}
	}

	${({ $skip }) =>
		$skip &&
		css`
			.sc_progress {
				animation: none;
				transform: scaleX(1);
			}
		`}

	@keyframes pgFadeIn {
		to {
			opacity: 1;
		}
	}

	@keyframes pgFadeUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pgGridDrift {
		to {
			transform: translate(56px, 56px);
		}
	}

	@keyframes pgFromLeft {
		from {
			opacity: 0;
			transform: translateX(-38%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes pgFromRight {
		from {
			opacity: 0;
			transform: translateX(38%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes pgPulse {
		from {
			filter: drop-shadow(0 0 0 transparent);
		}
		to {
			filter: drop-shadow(0 0 14px ${({ theme }) => theme.intro.glow});
		}
	}

	@keyframes pgGrowY {
		to {
			transform: scaleY(1);
		}
	}

	@keyframes pgGrowX {
		to {
			transform: scaleX(1);
		}
	}

	@keyframes pgRise {
		to {
			transform: translateY(0);
		}
	}

	/* Lift-off: the whole screen slides up and away */
	@keyframes pgIntroOutNow {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-100%);
			pointer-events: none;
		}
	}

	@keyframes pgIntroOut {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-100%);
			pointer-events: none;
		}
	}
`;
