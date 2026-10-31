import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LuMessageSquareQuote, LuShieldAlert } from 'react-icons/lu';
import ReviewServices from '../../features/services/custom-hooks/reviews';
import RatingStars from '../rating-stars';
import ProfileAvatar from '../profile-avatar';
import Pagination from '../pagination';
import EmptyState from '../empty-state';
import AppLoader from '../loader';
import { REVIEW_ROLES } from '../../utilities/app-const';
import { ROUTES } from '../../utilities/app-routes';

// The one reviews block every profile page embeds (frontend-plan §2):
// summary (denormalized ratingAverage / ratingCount) + paginated list from
// GET /api/reviews. Reviews can only be written after a completed job,
// so there's no form here. Staff also get a "Moderate" link to this
// profile's reviews (and ban controls) in the admin console.

const List = styled.ul`
	display: flex;
	flex-direction: column;

	li {
		display: flex;
		gap: 14px;
		padding: 18px 0;
		border-bottom: 1px solid ${({ theme }) => theme.card.border};

		&:last-child {
			border-bottom: 0;
		}
	}

	.sc_name {
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_date {
		font-size: 13px;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_comment {
		margin-top: 8px;
		font-size: 15px;
		line-height: 1.6;
		color: ${({ theme }) => theme.text.secondary};
		white-space: pre-line;
	}
`;

function ReviewsBlock({
	profileType,
	profileId,
	ratingAverage = 0,
	ratingCount = 0,
}) {
	const [page, setPage] = useState(1);
	const { data, isPending, isError } = ReviewServices.getProfileReviews({
		profileType,
		profileId,
		page,
	});
	const reviews = data?.data ?? [];
	const { user } = useSelector((state) => state.auth);
	const isStaff = REVIEW_ROLES.includes(user?.systemRole);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-4">
				<span className="font-display text-5xl font-semibold text-(--pg-text-primary)">
					{ratingCount ? Number(ratingAverage).toFixed(1) : '—'}
				</span>
				<div className="flex flex-col gap-1">
					<RatingStars value={ratingAverage} size={18} showValue={false} />
					<span className="text-sm text-(--pg-text-secondary)">
						{ratingCount
							? `${ratingCount} review${ratingCount === 1 ? '' : 's'}`
							: 'No reviews yet'}
					</span>
				</div>
				{isStaff && profileId && (
					<Link
						to={`${ROUTES.ADMIN_MODERATION}?tab=reviews&profileType=${profileType}&profileId=${profileId}`}
						className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-(--pg-card-border) px-3 py-1.5 text-xs font-semibold text-(--pg-text-secondary) hover:text-(--pg-text-primary)"
					>
						<LuShieldAlert aria-hidden="true" /> Moderate
					</Link>
				)}
			</div>

			{isPending && <AppLoader size={24} />}

			{!isPending && (isError || reviews.length === 0) && (
				<EmptyState
					compact
					icon={<LuMessageSquareQuote />}
					title={isError ? 'Couldn’t load reviews' : 'No reviews yet'}
					text={
						isError
							? 'Try again in a moment.'
							: 'Reviews appear here after a client completes a job with this profile.'
					}
				/>
			)}

			{reviews.length > 0 && (
				<List>
					{reviews.map((review) => (
						<li key={review.id}>
							<ProfileAvatar name={review.reviewer?.fullName} size={40} />
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<span className="sc_name">
										{review.reviewer?.fullName || 'PolyGrid member'}
									</span>
									<span className="sc_date">
										{new Date(review.createdAt).toLocaleDateString('en-GB', {
											day: 'numeric',
											month: 'short',
											year: 'numeric',
										})}
									</span>
								</div>
								<RatingStars
									value={review.rating}
									size={13}
									showValue={false}
								/>
								{review.comment && (
									<p className="sc_comment">{review.comment}</p>
								)}
							</div>
						</li>
					))}
				</List>
			)}

			{data?.pagination?.totalPages > 1 && (
				<Pagination
					pagination={data.pagination}
					changePage={setPage}
					showSummary={false}
				/>
			)}
		</div>
	);
}

ReviewsBlock.propTypes = {
	profileType: PropTypes.string.isRequired,
	profileId: PropTypes.string,
	ratingAverage: PropTypes.number,
	ratingCount: PropTypes.number,
};

export default ReviewsBlock;
