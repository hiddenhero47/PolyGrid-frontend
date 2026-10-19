import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// GET /api/reviews?profileType=&profileId=&page=&limit= — public, newest
// first, hidden reviews already excluded server-side (frontend-plan §2).
// Returns { data: [{ id, rating, comment, reviewer: { fullName }, createdAt }], pagination }.
const useGetProfileReviewsQuery = ({
	profileType,
	profileId,
	page = 1,
	limit = 5,
}) =>
	useQuery({
		queryKey: ['reviews', profileType, profileId, page, limit],
		queryFn: () =>
			axiosCall({
				url: '/api/reviews',
				method: 'GET',
				params: { profileType, profileId, page, limit },
				silent: true,
			}),
		enabled: Boolean(profileType && profileId),
		placeholderData: keepPreviousData,
	});

const ReviewServices = {
	getProfileReviews: useGetProfileReviewsQuery,
};

export default ReviewServices;
