import {
	useMutation,
	useQuery,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { axiosCall } from '../index-client';

// Notifications (frontend-plan §2 "Notification feed", §B.17) —
// polygrid-backend notificationRoutes.ts. New ones also arrive live over
// the socket (layouts/realtime-bridge.jsx), which refreshes these.

export const NOTIFICATIONS_KEY = ['notifications'];

// GET /api/notifications/unread-count → { count }
const useUnreadCountQuery = (options = {}) =>
	useQuery({
		queryKey: [...NOTIFICATIONS_KEY, 'unread'],
		queryFn: () =>
			axiosCall({
				url: '/api/notifications/unread-count',
				method: 'GET',
				silent: true,
			}),
		select: (res) => res?.count ?? 0,
		// a safety net in case the socket is down; live events refresh sooner
		refetchInterval: 2 * 60 * 1000,
		...options,
	});

// GET /api/notifications?page=&limit= → { data: [{ _id, type, message,
// data, isRead, createdAt }], pagination }, newest first
const useNotificationsQuery = ({ page = 1, limit = 20 } = {}, options = {}) =>
	useQuery({
		queryKey: [...NOTIFICATIONS_KEY, 'list', { page, limit }],
		queryFn: () =>
			axiosCall({
				url: '/api/notifications',
				method: 'GET',
				params: { page, limit },
			}),
		placeholderData: keepPreviousData,
		...options,
	});

const useRefresh = () => {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
};

// PATCH /api/notifications/:id/read — shown as read straight away (badge
// and lists), then confirmed by a refetch.
const useMarkReadMutation = () => {
	const queryClient = useQueryClient();
	const refresh = useRefresh();
	return useMutation({
		mutationFn: (id) =>
			axiosCall({
				url: `/api/notifications/${id}/read`,
				method: 'PATCH',
				silent: true,
			}),
		onMutate: (id) => {
			queryClient.setQueryData([...NOTIFICATIONS_KEY, 'unread'], (res) =>
				res ? { ...res, count: Math.max(0, (res.count || 0) - 1) } : res
			);
			queryClient.setQueriesData(
				{ queryKey: [...NOTIFICATIONS_KEY, 'list'] },
				(res) =>
					res?.data
						? {
								...res,
								data: res.data.map((n) =>
									n._id === id ? { ...n, isRead: true } : n
								),
							}
						: res
			);
		},
		onSettled: refresh,
	});
};

// PATCH /api/notifications/read-all
const useMarkAllReadMutation = () => {
	const refresh = useRefresh();
	return useMutation({
		mutationFn: () =>
			axiosCall({ url: '/api/notifications/read-all', method: 'PATCH' }),
		onSuccess: refresh,
	});
};

const NotificationServices = {
	unreadCount: useUnreadCountQuery,
	list: useNotificationsQuery,
	markRead: useMarkReadMutation,
	markAllRead: useMarkAllReadMutation,
};

export default NotificationServices;
