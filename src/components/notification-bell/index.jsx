import React, { useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuBell, LuCheckCheck, LuBellOff } from 'react-icons/lu';
import NotificationServices from '../../features/services/custom-hooks/notifications';
import { SUPPORTS_ANCHOR, anchorName } from '../form-components/helpers';
import { ROUTES } from '../../utilities/app-routes';
import { notificationLink } from '../../utilities/notifications';
import NotificationRow from './notification-row';
import { BellButton, BellPanel } from './index.style';

const EDGE = 12;
const placeRight = (trigger, panel) => {
	if (SUPPORTS_ANCHOR || !trigger || !panel) return;
	const rect = trigger.getBoundingClientRect();
	const width = panel.offsetWidth || 380;
	panel.style.left = `${Math.max(EDGE, Math.min(rect.right - width, window.innerWidth - width - EDGE))}px`;
	panel.style.top = `${rect.bottom + 8}px`;
};

// frontend-plan §2 "Notification feed": the bell with an unread badge,
// opening the latest few (popover, like the account menu). Picking one
// marks it read and goes where it's about. The list only loads once the
// panel has been opened.
function NotificationBell() {
	const navigate = useNavigate();
	const panelId = useId();
	const anchor = anchorName('bell', panelId);
	const triggerRef = useRef(null);
	const panelRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [opened, setOpened] = useState(false);

	const { data: unread = 0 } = NotificationServices.unreadCount();
	const list = NotificationServices.list(
		{ page: 1, limit: 8 },
		{ enabled: opened }
	);
	const markRead = NotificationServices.markRead();
	const markAll = NotificationServices.markAllRead();
	const items = list.data?.data || [];

	const select = (notification) => {
		panelRef.current?.hidePopover();
		if (!notification.isRead) markRead.mutate(notification._id);
		navigate(notificationLink(notification));
	};

	return (
		<>
			<BellButton
				ref={triggerRef}
				type="button"
				popoverTarget={panelId}
				aria-haspopup="true"
				aria-expanded={open}
				aria-label={
					unread ? `Notifications, ${unread} unread` : 'Notifications'
				}
				style={{ anchorName: anchor }}
			>
				<LuBell aria-hidden="true" />
				{unread > 0 && (
					<span className="sc_badge">{unread > 99 ? '99+' : unread}</span>
				)}
			</BellButton>

			<BellPanel
				ref={panelRef}
				id={panelId}
				popover="auto"
				onBeforeToggle={(e) => {
					if (e.newState === 'open')
						placeRight(triggerRef.current, panelRef.current);
				}}
				onToggle={(e) => {
					const isOpen = e.newState === 'open';
					setOpen(isOpen);
					if (isOpen) setOpened(true);
				}}
				style={{ positionAnchor: anchor }}
			>
				<div className="sc_head">
					<span className="font-label text-xs font-semibold tracking-[0.16em] uppercase">
						Notifications
					</span>
					{unread > 0 && (
						<button
							type="button"
							onClick={() => markAll.mutate()}
							disabled={markAll.isPending}
							className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--pg-text-link) hover:underline"
						>
							<LuCheckCheck aria-hidden="true" /> Mark all read
						</button>
					)}
				</div>
				<div className="sc_list">
					{list.isPending ? (
						<p className="p-6 text-center text-sm text-(--pg-text-secondary)">
							Loading…
						</p>
					) : items.length === 0 ? (
						<div className="flex flex-col items-center gap-2 p-8 text-center text-(--pg-text-secondary)">
							<LuBellOff className="text-2xl" aria-hidden="true" />
							<span className="text-sm">You’re all caught up.</span>
						</div>
					) : (
						<ul>
							{items.map((n) => (
								<li key={n._id}>
									<NotificationRow notification={n} onSelect={select} />
								</li>
							))}
						</ul>
					)}
				</div>
				<div className="sc_foot">
					<Link
						to={ROUTES.DASHBOARD_NOTIFICATIONS}
						onClick={() => panelRef.current?.hidePopover()}
						className="text-sm font-semibold text-(--pg-text-link) hover:underline"
					>
						See all notifications
					</Link>
				</div>
			</BellPanel>
		</>
	);
}

export default NotificationBell;
