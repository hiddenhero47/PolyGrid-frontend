import React from 'react';
import PropTypes from 'prop-types';
import { notificationMeta, timeAgo } from '../../utilities/notifications';
import { NotificationItem } from './index.style';

// One notification as a button: icon by type, message, age, unread dot.
function NotificationRow({ notification, onSelect }) {
	const { icon: Icon, tone } = notificationMeta(notification);
	return (
		<NotificationItem
			type="button"
			$tone={tone}
			$read={notification.isRead}
			onClick={() => onSelect(notification)}
		>
			<span className="sc_icon" aria-hidden="true">
				<Icon />
			</span>
			<span className="min-w-0 flex-1">
				<span className="sc_message">{notification.message}</span>
				<span className="sc_time">{timeAgo(notification.createdAt)}</span>
			</span>
			{!notification.isRead && <span className="sc_dot" aria-label="Unread" />}
		</NotificationItem>
	);
}

NotificationRow.propTypes = {
	notification: PropTypes.object.isRequired,
	onSelect: PropTypes.func.isRequired,
};

export default NotificationRow;
