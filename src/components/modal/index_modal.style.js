import styled, { css } from 'styled-components';

// Open AND close are animated with plain CSS transitions:
//   - @starting-style gives the "from" state when the dialog opens
//   - transition-behavior: allow-discrete on `display` / `overlay` keeps
//     the dialog painted (and in the top layer) while it animates closed
// Browsers without these (older Safari) simply open/close instantly.

const DURATION = '0.32s';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Where the panel sits, and where it slides in from.
const positions = {
	center: css`
		align-items: center;
		justify-content: center;
		padding: ${({ $borderPaddingY }) => $borderPaddingY || '40px'} 16px;

		.sc_panel {
			--pg-modal-from: translateY(12px) scale(0.97);
		}
	`,
	left: css`
		align-items: stretch;
		justify-content: flex-start;

		.sc_panel {
			height: ${({ $height }) => $height || '100%'};
			margin-left: ${({ $marginOffset }) => $marginOffset || '0px'};
			--pg-modal-from: translateX(-100%);
		}
	`,
	right: css`
		align-items: stretch;
		justify-content: flex-end;

		.sc_panel {
			height: ${({ $height }) => $height || '100%'};
			--pg-modal-from: translateX(100%);
		}
	`,
	bottom: css`
		align-items: flex-end;
		justify-content: center;

		.sc_panel {
			height: ${({ $height }) => $height || 'auto'};
			max-height: 92vh;
			--pg-modal-from: translateY(100%);
		}
	`,
};

export const ModalDialog = styled.dialog`
	/* the dialog is the full-screen backdrop; the panel sits inside it */
	position: fixed;
	inset: 0;
	width: 100%;
	height: 100%;
	max-width: none;
	max-height: none;
	margin: 0;
	padding: 0;
	border: 0;
	overflow-y: auto;
	overscroll-behavior: contain;
	background-color: ${({ theme }) => theme.modal.backdrop};
	color: ${({ theme }) => theme.text.primary};
	backdrop-filter: blur(3px);
	-webkit-backdrop-filter: blur(3px);

	&::backdrop {
		background: transparent;
	}

	&[open] {
		display: flex;
	}

	${({ $position }) => positions[$position] || positions.center}

	.sc_panel {
		position: relative;
		width: ${({ $width }) => $width || 'auto'};
		max-width: ${({ $maxWidth }) => $maxWidth || '100%'};
		flex-shrink: 0;
		outline: none;
	}

	@media (max-width: ${({ $mediaQuery }) => $mediaQuery || '500px'}) {
		.sc_panel {
			width: ${({ $queryWidth, $minWidth, $width }) =>
				$queryWidth || $minWidth || $width || 'auto'};
		}
	}

	/* ── animation ── */
	${({ $animation }) =>
		$animation &&
		css`
			opacity: 0;
			transition:
				opacity ${DURATION} ease,
				overlay ${DURATION} allow-discrete,
				display ${DURATION} allow-discrete;

			.sc_panel {
				transform: var(--pg-modal-from);
				transition: transform ${DURATION} ${EASE};
			}

			&[open] {
				opacity: 1;

				.sc_panel {
					transform: none;
				}
			}

			@starting-style {
				&[open] {
					opacity: 0;
				}

				&[open] .sc_panel {
					transform: var(--pg-modal-from);
				}
			}

			@media (prefers-reduced-motion: reduce) {
				.sc_panel {
					transition: none;
					transform: none;
				}
			}
		`}
`;

// Optional standard card for modal content: header (title + close),
// scrolling body, footer for actions. Drawers and sheets fill their side.
export const CardShell = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	max-height: ${({ $fill }) => ($fill ? '100%' : 'calc(100vh - 80px)')};
	height: ${({ $fill }) => ($fill ? '100%' : 'auto')};
	background-color: ${({ theme }) => theme.modal.background};
	border: 1px solid ${({ theme }) => theme.modal.border};
	border-radius: ${({ $radius }) => $radius};
	box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.45);
	overflow: hidden;

	.sc_handle {
		align-self: center;
		width: 40px;
		height: 4px;
		margin-top: 10px;
		border-radius: 999px;
		background-color: ${({ theme }) => theme.modal.handle};
	}

	.sc_header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 20px 22px 16px;
		border-bottom: 1px solid ${({ theme }) => theme.modal.divider};
	}

	.sc_eyebrow {
		font-family: var(--font-label);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.highlight};
	}

	.sc_title {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_subtitle {
		margin-top: 6px;
		font-size: 14px;
		line-height: 1.5;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_close {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		margin: -4px -6px 0 0;
		border-radius: 8px;
		font-size: 20px;
		color: ${({ theme }) => theme.text.secondary};
		transition:
			background-color 0.15s ease,
			color 0.15s ease;

		&:hover {
			background-color: ${({ theme }) => theme.state.hover};
			color: ${({ theme }) => theme.text.primary};
		}
	}

	.sc_body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 20px 22px;
	}

	.sc_footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 10px;
		padding: 14px 22px;
		border-top: 1px solid ${({ theme }) => theme.modal.divider};
	}
`;
