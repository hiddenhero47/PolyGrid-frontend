import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '../features/services/socket';
import { NOTIFICATIONS_KEY } from '../features/services/custom-hooks/notifications';
import { toast } from './toast/toast-handler';
import { notificationLink } from '../utilities/notifications';

// Keeps the Socket.IO connection in step with the session and turns live
// events into app updates: `notification:new` refreshes the bell / list
// and shows a toast with a link. Renders nothing.
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

		socket.on('notification:new', onNotification);
		return () => {
			socket.off('notification:new', onNotification);
			disconnectSocket();
		};
	}, [token, queryClient, navigate]);

	return null;
}

export default RealtimeBridge;
