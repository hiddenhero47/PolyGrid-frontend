import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Messages (frontend-plan §B.16, polygrid-backend conversationRoutes.ts /
// messageRoutes.ts): one conversation per pair of contacts, plain text,
// newest-first pages. New messages also arrive live as `message:new`
// over the socket (layouts/realtime-bridge.jsx puts them in these
// caches). No typing or presence indicators exist.

export const CONVERSATIONS_KEY = ['conversations'];
export const messagesKey = (conversationId) => ['messages', conversationId];
const PAGE_SIZE = 30;

// GET /api/conversations → { data: [{ id, otherParticipant: { id,
// fullName, avatar }, lastMessageAt, lastMessagePreview, unreadCount }],
// pagination } — most recent first
const useConversationsQuery = (options = {}) =>
	useQuery({
		queryKey: CONVERSATIONS_KEY,
		queryFn: () =>
			axiosCall({
				url: '/api/conversations',
				method: 'GET',
				params: { page: 1, limit: 50 },
				silent: true,
			}),
		refetchInterval: 2 * 60 * 1000,
		...options,
	});

// unread across conversations, for the menu badge
const useUnreadMessagesCount = (options = {}) =>
	useConversationsQuery({
		select: (res) =>
			(res?.data || []).reduce((n, c) => n + (c.unreadCount || 0), 0),
		...options,
	});

// GET /api/conversations/:id/messages?page= — pages newest first; the
// thread shows them oldest → newest
const useMessagesQuery = (conversationId) =>
	useInfiniteQuery({
		queryKey: messagesKey(conversationId),
		queryFn: ({ pageParam }) =>
			axiosCall({
				url: `/api/conversations/${conversationId}/messages`,
				method: 'GET',
				params: { page: pageParam, limit: PAGE_SIZE },
				silent: true,
			}),
		initialPageParam: 1,
		getNextPageParam: (last) =>
			last?.pagination && last.pagination.page < last.pagination.totalPages
				? last.pagination.page + 1
				: undefined,
		enabled: Boolean(conversationId),
	});

// Put one message at the newest end of a thread's cache (no duplicates).
export const addMessageToCache = (queryClient, message) =>
	queryClient.setQueryData(
		messagesKey(String(message.conversationId)),
		(old) => {
			if (!old?.pages?.length) return old;
			if (old.pages.some((p) => p.data?.some((m) => m._id === message._id)))
				return old;
			const [first, ...rest] = old.pages;
			return {
				...old,
				pages: [{ ...first, data: [message, ...(first.data || [])] }, ...rest],
			};
		}
	);

// POST /api/conversations { userId } → the conversation summary (403 if
// you aren't contacts)
const useStartConversationMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId) =>
			axiosCall({
				url: '/api/conversations',
				method: 'POST',
				data: { userId },
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
	});
};

// POST /api/conversations/:id/messages { body }
const useSendMessageMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ conversationId, body }) =>
			axiosCall({
				url: `/api/conversations/${conversationId}/messages`,
				method: 'POST',
				data: { body },
			}),
		onSuccess: (message) => {
			addMessageToCache(queryClient, message);
			queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
		},
	});
};

// PATCH /api/conversations/:id/read — clears that conversation's unread
// count straight away, then confirms
const useMarkReadMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (conversationId) =>
			axiosCall({
				url: `/api/conversations/${conversationId}/read`,
				method: 'PATCH',
				silent: true,
			}),
		onMutate: (conversationId) =>
			queryClient.setQueryData(CONVERSATIONS_KEY, (old) =>
				old?.data
					? {
							...old,
							data: old.data.map((c) =>
								c.id === conversationId ? { ...c, unreadCount: 0 } : c
							),
						}
					: old
			),
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
	});
};

// POST /api/messages/:id/report { reason } — the outcome is admin-side
const useReportMessageMutation = () =>
	useMutation({
		mutationFn: ({ messageId, reason }) =>
			axiosCall({
				url: `/api/messages/${messageId}/report`,
				method: 'POST',
				data: { reason },
			}),
	});

const MessageServices = {
	conversations: useConversationsQuery,
	unreadCount: useUnreadMessagesCount,
	messages: useMessagesQuery,
	start: useStartConversationMutation,
	send: useSendMessageMutation,
	markRead: useMarkReadMutation,
	report: useReportMessageMutation,
};

export default MessageServices;
