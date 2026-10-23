import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
	LuCheckCheck,
	LuBellOff,
	LuCloudOff,
	LuRotateCw,
} from 'react-icons/lu';
import NotificationServices from '../../features/services/custom-hooks/notifications';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import NotificationRow from '../../components/notification-bell/notification-row';
import { notificationLink } from '../../utilities/notifications';

const LIMIT = 20;

// frontend-plan §B.17 — every notification, newest first. Picking one
// marks it read and opens what it's about. New ones arrive live (socket)
// and appear here without a reload. URL: ?page=
function Notifications() {
	const navigate = useNavigate();
	const [params, setParams] = useSearchParams();
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const { data, isPending, isError, refetch } = NotificationServices.list({
		page,
		limit: LIMIT,
	});
	const { data: unread = 0 } = NotificationServices.unreadCount();
	const markRead = NotificationServices.markRead();
	const markAll = NotificationServices.markAllRead();
	const items = data?.data || [];

	const select = (notification) => {
		if (!notification.isRead) markRead.mutate(notification._id);
		navigate(notificationLink(notification));
	};

	return (
		<>
			<PageHeader
				eyebrow="Activity"
				title="Notifications"
				subtitle="Decisions, awards and job updates — the things that happened while you were away."
				actions={
					unread > 0 && (
						<AppButton
							variant="secondary"
							icon={<LuCheckCheck />}
							onClick={() => markAll.mutate()}
							disabled={markAll.isPending}
						>
							Mark all read
						</AppButton>
					)
				}
			/>

			{isPending ? (
				<div className="flex flex-col gap-3">
					{Array.from({ length: 5 }, (_, i) => (
						<SkeletonBar key={i} $width="100%" style={{ height: 56 }} />
					))}
				</div>
			) : isError ? (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load notifications"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
							Retry
						</AppButton>
					}
				/>
			) : items.length === 0 ? (
				<EmptyState
					icon={<LuBellOff />}
					title="No notifications yet"
					text="Verification decisions, tender awards, application answers and job updates will show up here."
				/>
			) : (
				<ul className="divide-y divide-(--pg-card-border) overflow-hidden rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background)">
					{items.map((n) => (
						<li key={n._id}>
							<NotificationRow notification={n} onSelect={select} />
						</li>
					))}
				</ul>
			)}

			{data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination
						pagination={data.pagination}
						changePage={(next) =>
							setParams(next > 1 ? { page: String(next) } : {})
						}
					/>
				</div>
			)}
		</>
	);
}

export default Notifications;
