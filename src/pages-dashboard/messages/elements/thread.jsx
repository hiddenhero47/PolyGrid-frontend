import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { LuArrowLeft, LuFlag, LuSendHorizontal } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import MessageServices from '../../../features/services/custom-hooks/messages';
import { toast } from '../../../layouts/toast/toast-handler';
import AppLoader from '../../../components/loader';
import ProfileAvatar from '../../../components/profile-avatar';
import { AppButton } from '../../../components/button';
import { ROUTES } from '../../../utilities/app-routes';
import { idOf } from '../../elements/listing-helpers';
import ReasonModal from '../../../components/modal/reason-modal';

const MAX_BODY = 4000;

const dayLabel = (date) => {
	const d = new Date(date);
	const today = new Date();
	const yesterday = new Date(Date.now() - 864e5);
	if (d.toDateString() === today.toDateString()) return 'Today';
	if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
	return d.toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
};
const timeLabel = (date) =>
	new Date(date).toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});

// One conversation: history (newest page first from the backend, shown
// oldest → newest), "Load earlier", a composer (Enter sends, Shift+Enter
// new line) and Report on the other person's messages.
function Thread({ conversationId, other }) {
	const { user } = useSelector((state) => state.auth);
	const messages = MessageServices.messages(conversationId);
	const send = MessageServices.send();
	const markRead = MessageServices.markRead();
	const report = MessageServices.report();
	const reportRef = useRef(null);
	const [draft, setDraft] = useState('');

	const list = (messages.data?.pages || [])
		.flatMap((p) => p.data || [])
		.slice()
		.reverse();
	const newest = list[list.length - 1];

	// Opening the thread or a new message arriving in it marks it read —
	// syncing the server's read marker with what's on screen.
	const { mutate: markReadNow } = markRead;
	useEffect(() => {
		if (conversationId) markReadNow(conversationId);
	}, [conversationId, newest?._id, markReadNow]);

	const submit = (e) => {
		e?.preventDefault();
		const body = draft.trim();
		if (!body || send.isPending) return;
		send.mutate({ conversationId, body }, { onSuccess: () => setDraft('') });
	};

	const onReport = async (message) => {
		const reason = await reportRef.current.ask({
			eyebrow: 'Report message',
			title: 'What’s wrong with it?',
			text: 'PolyGrid’s team reviews reports privately. The other person isn’t told who reported it.',
			label: 'Reason',
			required: true,
			confirmLabel: 'Report',
		});
		if (reason)
			report.mutate(
				{ messageId: message._id, reason },
				{ onSuccess: () => toast.success('Reported — thank you') }
			);
	};

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex items-center gap-3 border-b border-(--pg-card-border) px-4 py-3">
				<Link
					to={ROUTES.DASHBOARD_MESSAGES}
					aria-label="All conversations"
					className="inline-flex size-9 items-center justify-center rounded-lg text-(--pg-text-secondary) hover:bg-(--pg-state-hover) lg:hidden"
				>
					<LuArrowLeft aria-hidden="true" />
				</Link>
				<ProfileAvatar
					name={other?.fullName || ''}
					avatar={other?.avatar ? { url: other.avatar } : undefined}
					size={38}
				/>
				<span className="truncate font-semibold text-(--pg-text-primary)">
					{other?.fullName || 'Conversation'}
				</span>
			</div>

			<div
				className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
				aria-live="polite"
			>
				{messages.isPending ? (
					<div className="grid h-full place-items-center">
						<AppLoader showLabel label="Loading messages" />
					</div>
				) : messages.isError ? (
					<p className="text-sm text-(--pg-status-error)">
						Couldn’t load this conversation.
					</p>
				) : (
					<>
						{messages.hasNextPage && (
							<div className="mb-4 text-center">
								<AppButton
									variant="secondary"
									onClick={() => messages.fetchNextPage()}
									disabled={messages.isFetchingNextPage}
								>
									{messages.isFetchingNextPage ? 'Loading…' : 'Load earlier'}
								</AppButton>
							</div>
						)}
						{list.length === 0 && (
							<p className="mt-10 text-center text-sm text-(--pg-text-secondary)">
								No messages yet — say hello.
							</p>
						)}
						<ol className="flex flex-col gap-1.5">
							{list.map((m, i) => {
								const mine = idOf(m.sender) === String(user?.id);
								const day = dayLabel(m.createdAt);
								const showDay =
									i === 0 || dayLabel(list[i - 1].createdAt) !== day;
								return (
									<React.Fragment key={m._id}>
										{showDay && (
											<li className="font-label my-3 text-center text-[11px] tracking-[0.12em] text-(--pg-text-secondary) uppercase">
												{day}
											</li>
										)}
										<li
											className={`group flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}
										>
											{!mine && (
												<button
													type="button"
													onClick={() => onReport(m)}
													aria-label="Report this message"
													title="Report"
													className="order-2 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-(--pg-text-secondary) opacity-0 group-hover:opacity-100 hover:text-(--pg-status-error) focus-visible:opacity-100"
												>
													<LuFlag aria-hidden="true" />
												</button>
											)}
											<div
												className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
													mine
														? 'rounded-br-md bg-(--pg-button-primaryBg) text-(--pg-button-primaryText)'
														: 'rounded-bl-md bg-(--pg-surface-card) text-(--pg-text-primary)'
												}`}
											>
												{m.body}
												<span
													className={`mt-0.5 block text-right text-[11px] ${mine ? 'opacity-80' : 'text-(--pg-text-secondary)'}`}
												>
													{timeLabel(m.createdAt)}
												</span>
											</div>
										</li>
									</React.Fragment>
								);
							})}
						</ol>
						{/* keyed by the newest message: a new one remounts it and scrolls the thread down */}
						<div
							key={newest?._id || 'empty'}
							ref={(el) => {
								if (el?.parentElement)
									el.parentElement.scrollTop = el.parentElement.scrollHeight;
							}}
						/>
					</>
				)}
			</div>

			<form
				onSubmit={submit}
				className="flex items-end gap-2 border-t border-(--pg-card-border) p-3"
			>
				<label htmlFor="message-draft" className="sr-only">
					Message
				</label>
				<textarea
					id="message-draft"
					rows={1}
					maxLength={MAX_BODY}
					placeholder="Write a message"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (
							e.key === 'Enter' &&
							!e.shiftKey &&
							!e.nativeEvent.isComposing
						) {
							e.preventDefault();
							submit();
						}
					}}
					className="max-h-40 min-h-[46px] flex-1 resize-none rounded-xl border border-(--pg-form-border) bg-(--pg-form-background) px-3.5 py-3 text-[15px] text-(--pg-text-primary) outline-none [field-sizing:content] focus:border-(--pg-form-focus)"
				/>
				<AppButton
					type="submit"
					icon={<LuSendHorizontal />}
					disabled={!draft.trim() || send.isPending}
				>
					Send
				</AppButton>
			</form>
			<ReasonModal refName={reportRef} />
		</div>
	);
}

Thread.propTypes = {
	conversationId: PropTypes.string.isRequired,
	other: PropTypes.object,
};

export default Thread;
