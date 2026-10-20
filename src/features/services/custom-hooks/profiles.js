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
// There's no single "my profiles" route, so it's six small GETs in
// parallel, each cached under the same key the editors use.
const useGetMyProfilesQueries = () =>
	useQueries({
		queries: Object.values(PROFILE_TYPE).map((profileType) => ({
			queryKey: myProfileKey(profileType),
			queryFn: () => fetchMyProfile(profileType),
		})),
		combine: (results) => ({
			profiles: Object.fromEntries(
				Object.values(PROFILE_TYPE).map((type, i) => [type, results[i].data])
			),
			isPending: results.some((r) => r.isPending),
			isError: results.some((r) => r.isError),
		}),
	});

// Every write below answers with the whole updated profile, so the
// cache is replaced rather than refetched.
const useProfileWrite = (profileType, request) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: (profile) => {
			queryClient.setQueryData(myProfileKey(profileType), profile);
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

// POST <base>/me/avatar — multipart, exactly one image.
const useUploadAvatarMutation = (profileType) =>
	useProfileWrite(profileType, (file) => {
		const body = new FormData();
		body.append('avatar', file);
		return axiosCall({
			url: `${PROFILE_API[profileType]}/me/avatar`,
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
	addPortfolioMedia: useAddPortfolioMediaMutation,
	removePortfolioMedia: useRemovePortfolioMediaMutation,
	removePortfolioItem: useRemovePortfolioItemMutation,
};

export default ProfileServices;
