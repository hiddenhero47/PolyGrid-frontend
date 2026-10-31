import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';
import { PROFILE_TYPE } from '../../../utilities/app-const';

// The signed-in user's own business profiles (frontend-plan §B.3).
// Every pillar has the same /me routes under its own base path.
export const PROFILE_API = {
	[PROFILE_TYPE.CONSULTANCY]: '/api/consultancy-profiles',
	[PROFILE_TYPE.CONTRACTOR]: '/api/contractor-profiles',
	[PROFILE_TYPE.LABOR]: '/api/labor-profiles',
	[PROFILE_TYPE.STORE]: '/api/store-profiles',
	[PROFILE_TYPE.DIGITAL_CREATOR]: '/api/digital-creator-profiles',
	[PROFILE_TYPE.CLIENT]: '/api/client-profiles',
};

// Where a pillar's picture uploads: a store has a logo, everyone else an
// avatar — POST <base>/me/<route>, one image under that field name.
const IMAGE_ROUTE = { [PROFILE_TYPE.STORE]: 'logo' };

const myProfileKey = (profileType) => ['my-profile', profileType];

// GET <base>/me — the full profile whatever its verified / subscribed
// state; 404 just means "not created yet", so it resolves to null.
const fetchMyProfile = async (profileType) => {
	try {
		return await axiosCall({
			url: `${PROFILE_API[profileType]}/me`,
			method: 'GET',
			silent: true,
		});
	} catch (error) {
		if (error?.response?.status === 404) return null;
		throw error;
	}
};

const useGetMyProfileQuery = (profileType, options = {}) =>
	useQuery({
		queryKey: myProfileKey(profileType),
		queryFn: () => fetchMyProfile(profileType),
		enabled: Boolean(profileType),
		...options,
	});

// All six at once, for the Business Profile hub and the dashboard home.
// GET /api/users/me/profiles says which exist ({ [profileType]:
// { id, isVerified, status, slug } | null }); full profiles are then
// fetched only for those, cached under the same keys the editors use.
const SUMMARY_KEY = ['my-profiles-summary'];

const useGetMyProfilesQueries = () => {
	const summary = useQuery({
		queryKey: SUMMARY_KEY,
		queryFn: () => axiosCall({ url: '/api/users/me/profiles', method: 'GET' }),
	});
	const types = Object.values(PROFILE_TYPE);
	const owned = types.filter((type) => summary.data?.[type]);

	const full = useQueries({
		queries: owned.map((profileType) => ({
			queryKey: myProfileKey(profileType),
			queryFn: () => fetchMyProfile(profileType),
		})),
		combine: (results) => results,
	});

	return {
		profiles: Object.fromEntries(
			types.map((type) => {
				if (!summary.data) return [type, undefined];
				const i = owned.indexOf(type);
				return [type, i === -1 ? null : full[i]?.data];
			})
		),
		isPending: summary.isPending || full.some((r) => r.isPending),
		isError: summary.isError || full.some((r) => r.isError),
	};
};

// Every write below answers with the whole updated profile, so the
// cache is replaced rather than refetched.
const useProfileWrite = (profileType, request) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: (profile) => {
			queryClient.setQueryData(myProfileKey(profileType), profile);
			queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
			// public pages and search may now show different data
			queryClient.invalidateQueries({ queryKey: ['consultant'] });
			queryClient.invalidateQueries({ queryKey: ['consultants'] });
		},
	});
};

// POST <base> — create (consultancy: { headline, country, bio?, city?,
// specializations?, yearsOfExperience?, links? })
const useCreateProfileMutation = (profileType) =>
	useProfileWrite(profileType, (data) =>
		axiosCall({ url: PROFILE_API[profileType], method: 'POST', data })
	);

// PATCH <base>/me — any subset of the fields, plus (consultancy)
// services, mentorship and status ('active' | 'inactive').
const useUpdateProfileMutation = (profileType) =>
	useProfileWrite(profileType, (data) =>
		axiosCall({ url: `${PROFILE_API[profileType]}/me`, method: 'PATCH', data })
	);

// POST <base>/me/avatar (a store: /me/logo) — multipart, exactly one image.
const useUploadAvatarMutation = (profileType) =>
	useProfileWrite(profileType, (file) => {
		const route = IMAGE_ROUTE[profileType] || 'avatar';
		const body = new FormData();
		body.append(route, file);
		return axiosCall({
			url: `${PROFILE_API[profileType]}/me/${route}`,
			method: 'POST',
			data: body,
		});
	});

// POST <base>/me/portfolio — multipart: `data` = JSON { title,
// description?, tags?, startedAt?, completedAt? } + up to 6 images.
// May answer with `mediaWarnings` for images it skipped.
const useAddPortfolioItemMutation = (profileType) =>
	useProfileWrite(profileType, ({ fields, files = [] }) => {
		const body = new FormData();
		body.append('data', JSON.stringify(fields));
		files.forEach((file) => body.append('media', file));
		return axiosCall({
			url: `${PROFILE_API[profileType]}/me/portfolio`,
			method: 'POST',
			data: body,
		});
	});

// POST <base>/me/portfolio/:itemId/media — more images (6 per item max)
const useAddPortfolioMediaMutation = (profileType) =>
	useProfileWrite(profileType, ({ itemId, files }) => {
		const body = new FormData();
		files.forEach((file) => body.append('media', file));
		return axiosCall({
			url: `${PROFILE_API[profileType]}/me/portfolio/${itemId}/media`,
			method: 'POST',
			data: body,
		});
	});

// PATCH <base>/me/portfolio/:itemId { title?, description?, tags?,
// startedAt?, completedAt? } — null clears a date.
const useUpdatePortfolioItemMutation = (profileType) =>
	useProfileWrite(profileType, ({ itemId, ...data }) =>
		axiosCall({
			url: `${PROFILE_API[profileType]}/me/portfolio/${itemId}`,
			method: 'PATCH',
			data,
		})
	);

// DELETE <base>/me/portfolio/:itemId/media/:fileName
const useRemovePortfolioMediaMutation = (profileType) =>
	useProfileWrite(profileType, ({ itemId, fileName }) =>
		axiosCall({
			url: `${PROFILE_API[profileType]}/me/portfolio/${itemId}/media/${encodeURIComponent(fileName)}`,
			method: 'DELETE',
		})
	);

// DELETE <base>/me/portfolio/:itemId — the item and all its images
const useRemovePortfolioItemMutation = (profileType) =>
	useProfileWrite(profileType, (itemId) =>
		axiosCall({
			url: `${PROFILE_API[profileType]}/me/portfolio/${itemId}`,
			method: 'DELETE',
		})
	);

const ProfileServices = {
	getMyProfile: useGetMyProfileQuery,
	getMyProfiles: useGetMyProfilesQueries,
	createProfile: useCreateProfileMutation,
	updateProfile: useUpdateProfileMutation,
	uploadAvatar: useUploadAvatarMutation,
	addPortfolioItem: useAddPortfolioItemMutation,
	updatePortfolioItem: useUpdatePortfolioItemMutation,
	addPortfolioMedia: useAddPortfolioMediaMutation,
	removePortfolioMedia: useRemovePortfolioMediaMutation,
	removePortfolioItem: useRemovePortfolioItemMutation,
};

export default ProfileServices;
