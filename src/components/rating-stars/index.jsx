import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LuStar } from 'react-icons/lu';

// Read-only star rating: five stars filled to the average (halves via a
// clipped overlay), then "4.8 (24)". Profiles carry ratingAverage /
// ratingCount denormalized (frontend-plan §2).

const Wrapper = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-size: ${({ $size }) => $size}px;

	.sc_stars {
		position: relative;
		display: inline-flex;
		line-height: 0;
	}

	.sc_row {
		display: inline-flex;
		gap: 2px;
	}

	.sc_empty {
		color: ${({ theme }) => theme.border.strong};
	}

	.sc_filled {
		position: absolute;
		inset: 0;
		overflow: hidden;
		white-space: nowrap;
		color: ${({ theme }) => theme.status.warning};

		svg {
			fill: currentColor;
			flex-shrink: 0;
		}
	}

	.sc_value {
		font-size: 14px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_count {
		font-size: 14px;
		color: ${({ theme }) => theme.text.secondary};
	}
`;

function RatingStars({ value = 0, count, size = 15, showValue = true }) {
	const rating = Math.max(0, Math.min(5, Number(value) || 0));
	const stars = Array.from({ length: 5 }, (_, i) => <LuStar key={i} />);

	return (
		<Wrapper $size={size}>
			<span
				className="sc_stars"
				role="img"
				aria-label={`Rated ${rating.toFixed(1)} out of 5${count != null ? `, ${count} reviews` : ''}`}
			>
				<span className="sc_row sc_empty">{stars}</span>
				<span
					className="sc_row sc_filled"
					style={{ width: `${(rating / 5) * 100}%` }}
				>
					{stars}
				</span>
			</span>
			{showValue && (
				<span aria-hidden="true">
					<span className="sc_value">{count ? rating.toFixed(1) : 'New'}</span>
					{count != null && count > 0 && (
						<span className="sc_count"> ({count})</span>
					)}
				</span>
			)}
		</Wrapper>
	);
}

RatingStars.propTypes = {
	value: PropTypes.number,
	count: PropTypes.number,
	size: PropTypes.number,
	showValue: PropTypes.bool,
};

export default RatingStars;
