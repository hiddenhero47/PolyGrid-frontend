import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';

// PolyGrid's loader: a 3×3 grid of squares lighting up in a diagonal wave
// (a nod to the name). `fullPage` centers it in a tall block for page or
// section loading. Screen readers hear `label`.

const wave = keyframes`
	0%, 70%, 100% { opacity: 0.18; transform: scale(0.82); }
	35% { opacity: 1; transform: scale(1); }
`;

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 14px;
	min-height: ${({ $fullPage }) => ($fullPage ? '50vh' : 'auto')};
	padding: ${({ $fullPage }) => ($fullPage ? '40px 16px' : '0')};

	.sc_grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: ${({ $size }) => Math.max(2, Math.round($size / 12))}px;
		width: ${({ $size }) => $size}px;
		height: ${({ $size }) => $size}px;
	}

	.sc_cell {
		border-radius: ${({ $size }) => Math.max(1, Math.round($size / 16))}px;
		background-color: ${({ theme }) => theme.accent.default};
		animation: ${wave} 1.2s ease-in-out infinite;
	}

	.sc_label {
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.text.secondary};
	}

	@media (prefers-reduced-motion: reduce) {
		.sc_cell {
			animation-duration: 2.4s;
		}
	}
`;

function AppLoader({
	size = 36,
	label = 'Loading',
	showLabel = false,
	fullPage = false,
	className,
}) {
	return (
		<Wrapper
			$size={size}
			$fullPage={fullPage}
			role="status"
			aria-live="polite"
			className={className}
		>
			<div className="sc_grid" aria-hidden="true">
				{Array.from({ length: 9 }, (_, i) => {
					const row = Math.floor(i / 3);
					const col = i % 3;
					// diagonal wave: top-left first, bottom-right last
					return (
						<span
							key={i}
							className="sc_cell"
							style={{ animationDelay: `${(row + col) * 0.12}s` }}
						/>
					);
				})}
			</div>
			{showLabel ? (
				<span className="sc_label">{label}</span>
			) : (
				<span className="sr-only">{label}</span>
			)}
		</Wrapper>
	);
}

AppLoader.propTypes = {
	size: PropTypes.number,
	label: PropTypes.string,
	showLabel: PropTypes.bool,
	fullPage: PropTypes.bool,
	className: PropTypes.string,
};

export default AppLoader;
