import React from 'react';
import PropTypes from 'prop-types';
import { LuUsers } from 'react-icons/lu';
import ContactServices from '../../../features/services/custom-hooks/contacts';
import Modal from '../../../components/modal/index_modal';
import AppLoader from '../../../components/loader';
import EmptyState from '../../../components/empty-state';
import ProfileAvatar from '../../../components/profile-avatar';
import { AppButton } from '../../../components/button';
import { ROUTES } from '../../../utilities/app-routes';
import { idOf } from '../../elements/listing-helpers';

// Pick a contact to message — you can only message contacts.
function NewConversationModal({ refName, onPick, busy }) {
	const contacts = ContactServices.list({ page: 1, limit: 100 });
	const rows = contacts.data?.data || [];

	return (
		<Modal.Center refName={refName} width="520px" queryWidth="100%">
			<Modal.Card
				eyebrow="New message"
				title="Who to?"
				subtitle="Anyone you’ve worked with through PolyGrid is a contact — or add one by email on Contacts."
			>
				{contacts.isPending ? (
					<div className="grid min-h-40 place-items-center">
						<AppLoader showLabel label="Loading contacts" />
					</div>
				) : rows.length === 0 ? (
					<EmptyState
						icon={<LuUsers />}
						title="No contacts yet"
						text="Contacts appear when you start a job with someone."
						actions={
							<AppButton to={ROUTES.DASHBOARD_CONTACTS}>
								Add a contact
							</AppButton>
						}
					/>
				) : (
					<ul className="flex max-h-105 flex-col gap-1 overflow-y-auto">
						{rows.map((c) => {
							const name = c.fullName || c.email;
							return (
								<li key={idOf(c.user)}>
									<button
										type="button"
										disabled={busy}
										onClick={() => onPick(idOf(c.user))}
										className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-(--pg-state-hover) disabled:opacity-50"
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
											size={36}
										/>
										<span className="min-w-0">
											<span className="block truncate font-semibold text-(--pg-text-primary)">
												{name}
											</span>
											{c.fullName && (
												<span className="block truncate text-xs text-(--pg-text-secondary)">
													{c.email}
												</span>
											)}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</Modal.Card>
		</Modal.Center>
	);
}

NewConversationModal.propTypes = {
	refName: PropTypes.object.isRequired,
	onPick: PropTypes.func.isRequired,
	busy: PropTypes.bool,
};

export default NewConversationModal;
