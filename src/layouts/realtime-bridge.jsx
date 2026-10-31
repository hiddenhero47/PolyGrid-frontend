import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '../features/services/socket';
import { NOTIFICATIONS_KEY } from '../features/services/custom-hooks/notifications';
import {
	CONVERSATIONS_KEY,
	addMessageToCache,
} from '../features/services/custom-hooks/messages';
import { toast } from './toast/toast-handler';
import { notificationLink } from '../utilities/notifications';
import { ROUTES } from '../utilities/app-routes';

// Keeps the Socket.IO connection in step with the session and turns live
// events into app updates: `notification:new` refreshes the bell / list
// and shows a toast with a link; `message:new` drops the message into its
// thread and refreshes the conversation list (a toast too, unless that
// thread is open). Renders nothing.
//
// The one place an effect is the right tool: it synchronises the app with
// an outside system (the socket) for as long as a token exists, and
// tears it down on logout / token change.
function RealtimeBridge() {
	const { token } = useSelector((state) => state.auth);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	useEffect(() => {
		if (!token) return undefined;
		const socket = connectSocket(token);

		const onNotification = (notification) => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
			toast.info(notification.message, {
				title: 'New notification',
				actionText: 'View',
				onAction: () => navigate(notificationLink(notification)),
			});
		};

		const onMessage = (message) => {
			addMessageToCache(queryClient, message);
			queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
			const thread = `${ROUTES.DASHBOARD_MESSAGES}/${message.conversationId}`;
			if (window.location.pathname === thread) return;
			toast.info(
				message.body.length > 90
					? `${message.body.slice(0, 90)}…`
					: message.body,
				{
					title: 'New message',
					actionText: 'Reply',
					onAction: () => navigate(thread),
				}
			);
		};

		socket.on('notification:new', onNotification);
		socket.on('message:new', onMessage);
		return () => {
			socket.off('notification:new', onNotification);
			socket.off('message:new', onMessage);
			disconnectSocket();
		};
	}, [token, queryClient, navigate]);

	return null;
}

export default RealtimeBridge;
