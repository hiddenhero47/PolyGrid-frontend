import React, { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
	LuCloudOff,
	LuMessageSquare,
	LuRotateCw,
	LuUserMinus,
	LuUserPlus,
	LuUsers,
} from 'react-icons/lu';
import ContactServices from '../../../features/services/custom-hooks/contacts';
import MessageServices from '../../../features/services/custom-hooks/messages';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../../layouts/toast/toast-handler';
import EmptyState from '../../../components/empty-state';
import Pagination from '../../../components/pagination';
import ProfileAvatar from '../../../components/profile-avatar';
import ConfirmModal from '../../../components/modal/confirm-modal';
import { AppButton } from '../../../components/button';
import { CustomInput } from '../../../components/form-components';
import { SkeletonBar } from '../../../components/table/index.style';
import { formatDate } from '../../../utilities/basic-functions';
import { ROUTES } from '../../../utilities/app-routes';
import { Panel } from '../elements/panels';
import { idOf } from '../elements/listing-helpers';

const LIMIT = 20;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// frontend-plan §B.15 — Contacts: everyone you're connected with (made
// automatically by jobs, awards, accepted applications and orders, or
// added by email). Only contacts can message each other. Removing is
// one-way.
function Contacts() {
	const navigate = useNavigate();
	const [params, setParams] = useSearchParams();
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const contacts = ContactServices.list({ page, limit: LIMIT });
	const add = ContactServices.add();
	const remove = ContactServices.remove();
	const start = MessageServices.start();
	const confirmRef = useRef(null);
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const rows = contacts.data?.data || [];

	const onAdd = (e) => {
		e.preventDefault();
		if (!EMAIL.test(email.trim())) return setError('Enter their email address');
		setError('');
		add.mutate(
			{ email: email.trim().toLowerCase() },
			{
				onSuccess: () => {
					toast.success('Contact added — you can message each other now');
					setEmail('');
				},
			}
		);
	};

	const onRemove = async (contact) => {
		const ok = await confirmRef.current.ask({
			title: 'Remove this contact?',
			text: `${contact.fullName || contact.email} leaves your list. You stay in theirs, and you can’t message them until you’re reconnected.`,
			confirmLabel: 'Remove',
		});
		if (ok)
			remove.mutate(idOf(contact.user), {
				onSuccess: () => toast.success('Contact removed'),
			});
	};

	const onMessage = (contact) =>
		start.mutate(idOf(contact.user), {
			onSuccess: (conversation) =>
				navigate(`${ROUTES.DASHBOARD_MESSAGES}/${conversation.id}`),
		});

	return (
		<>
			<PageHeader
				eyebrow="Activity"
				title="Contacts"
				subtitle="People you’re connected with. Working together through PolyGrid connects you automatically; you can also add someone by email."
			/>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div className="min-w-0">
					{contacts.isPending ? (
						<div className="flex flex-col gap-3">
							{Array.from({ length: 4 }, (_, i) => (
								<SkeletonBar
									key={i}
									$width="100%"
									style={{ height: 72, borderRadius: 16 }}
								/>
							))}
						</div>
					) : contacts.isError ? (
						<EmptyState
							tone="error"
							icon={<LuCloudOff />}
							title="Couldn’t load your contacts"
							actions={
								<AppButton
									icon={<LuRotateCw />}
									onClick={() => contacts.refetch()}
								>
									Retry
								</AppButton>
							}
						/>
					) : rows.length === 0 ? (
						<EmptyState
							tone="accent"
							icon={<LuUsers />}
							title="No contacts yet"
							text="Start a job with someone and they’re added here — or add someone you know by email."
						/>
					) : (
						<ul className="flex flex-col gap-3">
							{rows.map((c) => {
								const name = c.fullName || c.email;
								return (
									<li
										key={idOf(c.user)}
										className="flex flex-wrap items-center gap-4 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-4"
									>
										<ProfileAvatar
											name={name}
											avatar={
												c.avatar?.url
													? c.avatar
													: c.avatar
														? { url: c.avatar }
														: undefined
											}
											size={44}
										/>
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-(--pg-text-primary)">
												{name}
											</p>
											<p className="truncate text-sm text-(--pg-text-secondary)">
												{c.fullName ? `${c.email} · ` : ''}Connected{' '}
												{formatDate(c.connectedAt)}
											</p>
										</div>
										<AppButton
											icon={<LuMessageSquare />}
											onClick={() => onMessage(c)}
											disabled={start.isPending}
										>
											Message
										</AppButton>
										<button
											type="button"
											aria-label={`Remove ${name}`}
											title="Remove"
											onClick={() => onRemove(c)}
											className="inline-flex size-10 items-center justify-center rounded-lg text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-status-error)"
										>
											<LuUserMinus aria-hidden="true" />
										</button>
									</li>
								);
							})}
						</ul>
					)}
					{contacts.data?.pagination?.totalPages > 1 && (
						<div className="mt-5">
							<Pagination
								pagination={contacts.data.pagination}
								changePage={(next) =>
									setParams(next > 1 ? { page: String(next) } : {})
								}
							/>
						</div>
					)}
				</div>

				<aside>
					<Panel title="Add a contact" icon={<LuUserPlus aria-hidden="true" />}>
						<form noValidate onSubmit={onAdd} className="flex flex-col gap-3">
							<CustomInput
								label="Their email"
								name="email"
								type="email"
								autoComplete="off"
								placeholder="name@company.com"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									setError('');
								}}
								isError={Boolean(error)}
								errormessage={error}
								hint="They need a PolyGrid account. You’re added to their contacts too."
							/>
							<AppButton
								type="submit"
								icon={<LuUserPlus />}
								disabled={add.isPending}
							>
								{add.isPending ? 'Adding…' : 'Add contact'}
							</AppButton>
						</form>
					</Panel>
				</aside>
			</div>

			<ConfirmModal refName={confirmRef} />
		</>
	);
}

export default Contacts;
