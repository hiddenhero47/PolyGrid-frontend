import React, { useRef } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { LuMessagesSquare, LuPenLine, LuRotateCw } from 'react-icons/lu';
import MessageServices from '../../../features/services/custom-hooks/messages';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import AppLoader from '../../../components/loader';
import EmptyState from '../../../components/empty-state';
import ProfileAvatar from '../../../components/profile-avatar';
import { AppButton } from '../../../components/button';
import { ROUTES } from '../../../utilities/app-routes';
import { timeAgo } from '../../../utilities/notifications';
import Thread from './elements/thread';
import NewConversationModal from './elements/new-conversation-modal';

// frontend-plan §B.16 — Messages: conversations on the left, the open
// thread on the right (one or the other on small screens).
// /dashboard/messages/:id opens a thread.
function Messages() {
	const { id } = useParams();
	const navigate = useNavigate();
	const newRef = useRef(null);
	const conversations = MessageServices.conversations();
	const start = MessageServices.start();
	const rows = conversations.data?.data || [];
	const current = rows.find((c) => c.id === id);

	const openWith = (userId) =>
		start.mutate(userId, {
			onSuccess: (conversation) => {
				newRef.current.close();
				navigate(`${ROUTES.DASHBOARD_MESSAGES}/${conversation.id}`);
			},
		});

	return (
		<>
			<PageHeader
				eyebrow="Activity"
				title="Messages"
				subtitle="Talk to the people you work with. You can message anyone in your contacts."
				actions={
					<AppButton icon={<LuPenLine />} onClick={() => newRef.current.open()}>
						New message
					</AppButton>
				}
			/>

			<div className="grid h-[calc(100dvh-300px)] min-h-120 overflow-hidden rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) lg:grid-cols-[320px_minmax(0,1fr)]">
				<div
					className={`min-h-0 flex-col border-(--pg-card-border) lg:flex lg:border-r ${id ? 'hidden' : 'flex'}`}
				>
					{conversations.isPending ? (
						<AppLoader />
					) : conversations.isError ? (
						<div className="p-5">
							<AppButton
								variant="secondary"
								icon={<LuRotateCw />}
								onClick={() => conversations.refetch()}
							>
								Retry
							</AppButton>
						</div>
					) : rows.length === 0 ? (
						<div className="p-5 text-sm text-(--pg-text-secondary)">
							No conversations yet.
						</div>
					) : (
						<ul className="min-h-0 flex-1 overflow-y-auto p-2">
							{rows.map((c) => (
								<li key={c.id}>
									<NavLink
										to={`${ROUTES.DASHBOARD_MESSAGES}/${c.id}`}
										className={({ isActive }) =>
											`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
												isActive
													? 'bg-(--pg-surface-card)'
													: 'hover:bg-(--pg-state-hover)'
											}`
										}
									>
										<ProfileAvatar
											name={c.otherParticipant?.fullName || ''}
											avatar={
												c.otherParticipant?.avatar
													? { url: c.otherParticipant.avatar }
													: undefined
											}
											size={42}
										/>
										<span className="min-w-0 flex-1">
											<span className="flex items-baseline justify-between gap-2">
												<span
													className={`truncate text-[15px] text-(--pg-text-primary) ${c.unreadCount ? 'font-bold' : 'font-semibold'}`}
												>
													{c.otherParticipant?.fullName || 'Someone'}
												</span>
												{c.lastMessageAt && (
													<span className="shrink-0 text-[11px] text-(--pg-text-secondary)">
														{timeAgo(c.lastMessageAt)}
													</span>
												)}
											</span>
											<span className="flex items-center justify-between gap-2">
												<span
													className={`truncate text-sm ${c.unreadCount ? 'text-(--pg-text-primary)' : 'text-(--pg-text-secondary)'}`}
												>
													{c.lastMessagePreview || 'No messages yet'}
												</span>
												{c.unreadCount > 0 && (
													<span className="shrink-0 rounded-full bg-(--pg-button-primaryBg) px-1.5 text-[11px] font-bold text-(--pg-button-primaryText)">
														{c.unreadCount}
													</span>
												)}
											</span>
										</span>
									</NavLink>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className={`min-h-0 ${id ? 'block' : 'hidden lg:block'}`}>
					{id ? (
						<Thread
							key={id}
							conversationId={id}
							other={current?.otherParticipant}
						/>
					) : (
						<div className="grid h-full place-items-center p-6">
							<EmptyState
								icon={<LuMessagesSquare />}
								title={rows.length ? 'Pick a conversation' : 'No messages yet'}
								text="Start one with anyone you’ve worked with — a job, an award, an order or an accepted application connects you."
								actions={
									<AppButton
										variant="secondary"
										onClick={() => newRef.current.open()}
									>
										New message
									</AppButton>
								}
							/>
						</div>
					)}
				</div>
			</div>

			<NewConversationModal
				refName={newRef}
				onPick={openWith}
				busy={start.isPending}
			/>
		</>
	);
}

export default Messages;
