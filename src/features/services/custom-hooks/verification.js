import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// The user's side of verification (frontend-plan §B.4) — the admin queue
// is in admin.js.

// GET /api/verification-templates/lookup?profileType=&country=&state=
// What this profile type must submit in this country: { fields: [{ key,
// label, type, required, options?, pattern?, minLength?, maxLength?,
// min?, max?, helpText? }], documents: [{ type, label, required,
// acceptedFormats }] }. 404 = no template for that place yet.
const useLookupTemplateQuery = ({ profileType, country, state }) =>
	useQuery({
		queryKey: ['verification-template', profileType, country, state || ''],
		queryFn: () =>
			axiosCall({
				url: '/api/verification-templates/lookup',
				method: 'GET',
				params: { profileType, country, state: state || undefined },
				silent: true,
			}),
		enabled: Boolean(profileType && country),
		staleTime: 10 * 60 * 1000,
	});

// GET /api/verifications/me?profileType= — every submission, newest
// first (nothing is ever overwritten), templateId populated with labels.
const useGetMyVerificationsQuery = (profileType) =>
	useQuery({
		queryKey: ['my-verifications', profileType || 'all'],
		queryFn: () =>
			axiosCall({
				url: '/api/verifications/me',
				method: 'GET',
				params: { profileType: profileType || undefined },
			}),
	});

// POST /api/verifications — multipart: `data` = JSON { profileType,
// profileId, country, state?, form } plus one file per template document,
// each under the document's `type` as its field name.
const useSubmitVerificationMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ fields, documents }) => {
			const body = new FormData();
			body.append('data', JSON.stringify(fields));
			Object.entries(documents).forEach(([type, file]) => {
				if (file) body.append(type, file);
			});
			return axiosCall({
				url: '/api/verifications',
				method: 'POST',
				data: body,
			});
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['my-verifications'] }),
	});
};

const VerificationServices = {
	lookupTemplate: useLookupTemplateQuery,
	getMyVerifications: useGetMyVerificationsQuery,
	submitVerification: useSubmitVerificationMutation,
};

export default VerificationServices;
