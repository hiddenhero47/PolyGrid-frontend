import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Contacts (frontend-plan §B.15, polygrid-backend contactRoutes.ts). Made
// automatically whenever two people start a job (or an award / accepted
// application / order), or added by hand by email. Messaging is only
// possible between contacts. Removing is one-way: you leave their list
// as it is.

export const CONTACTS_KEY = ['contacts'];

// GET /api/contacts?q=&page=&limit= → { data: [{ user, email, fullName,
// avatar, connectedAt }], pagination }, newest first; q matches name or
// email
const useContactsQuery = ({ q = '', page = 1, limit = 20 } = {}) =>
	useQuery({
		queryKey: [...CONTACTS_KEY, { q, page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/contacts',
				method: 'GET',
				params: { q: q || undefined, page, limit },
			}),
		placeholderData: keepPreviousData,
	});

const useContactsWrite = (request) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
	});
};

// POST /api/contacts { email } | { userId } — connects both ways
const useAddContactMutation = () =>
	useContactsWrite((data) =>
		axiosCall({ url: '/api/contacts', method: 'POST', data })
	);

// DELETE /api/contacts/:userId — from my list only
const useRemoveContactMutation = () =>
	useContactsWrite((userId) =>
		axiosCall({ url: `/api/contacts/${userId}`, method: 'DELETE' })
	);

const ContactServices = {
	list: useContactsQuery,
	add: useAddContactMutation,
	remove: useRemoveContactMutation,
};

export default ContactServices;
