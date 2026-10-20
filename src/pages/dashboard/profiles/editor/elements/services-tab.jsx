import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LuPlus, LuPencil, LuTrash2, LuPackageOpen } from 'react-icons/lu';
import ProfileServices from '../../../../../features/services/custom-hooks/profiles';
import { toast } from '../../../../../layouts/toast/toast-handler';
import EmptyState from '../../../../../components/empty-state';
import { AppButton } from '../../../../../components/button';
import {
	PROFILE_TYPE,
	PRICING_MODE_LABELS,
} from '../../../../../utilities/app-const';
import { formatMoney } from '../../../../../utilities/basic-functions';
import ConfirmModal from '../../../../../components/modal/confirm-modal';
import ServiceModal from './service-modal';
import { ListRow } from './index.style';

// The backend keeps services as one array on the profile — every change
// PATCHes the whole list.
const clean = ({
	title,
	description,
	pricingMode,
	price,
	currency,
	durationMinutes,
	_id,
}) => ({
	...(_id && { _id }),
	title,
	description,
	pricingMode,
	price,
	currency,
	...(durationMinutes && { durationMinutes }),
});

function ServicesTab({ profile }) {
	const modalRef = useRef(null);
	const confirmRef = useRef(null);
	const [editing, setEditing] = useState(null);
	const update = ProfileServices.updateProfile(PROFILE_TYPE.CONSULTANCY);
	const services = profile.services || [];

	const open = (service = null) => {
		setEditing(service);
		modalRef.current.open();
	};

	const save = (next, message) =>
		update.mutate(
			{ services: next.map(clean) },
			{
				onSuccess: () => {
					modalRef.current?.close();
					toast.success(message);
				},
			}
		);

	const handleSave = (listing) =>
		save(
			editing
				? services.map((s) => (s._id === editing._id ? listing : s))
				: [...services, listing],
			editing ? 'Service updated' : 'Service added'
		);

	const remove = async (service) => {
		const ok = await confirmRef.current.ask({
			title: 'Remove this service?',
			text: `“${service.title}” will no longer show on your public page.`,
			confirmLabel: 'Remove',
		});
		if (!ok) return;
		save(
			services.filter((s) => s._id !== service._id),
			'Service removed'
		);
	};

	return (
		<>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[15px] text-(--pg-text-secondary)">
					What clients can book you for. Prices are in USD.
				</p>
				<AppButton size="sm" icon={<LuPlus />} onClick={() => open()}>
					Add service
				</AppButton>
			</div>

			{services.length === 0 ? (
				<EmptyState
					compact
					tone="accent"
					icon={<LuPackageOpen />}
					title="No services yet"
					text="Add at least one so clients know what to hire you for."
				/>
			) : (
				<ul className="flex flex-col gap-3">
					{services.map((service) => (
						<ListRow key={service._id}>
							<div className="min-w-0 flex-1">
								<p className="sc_rowTitle">{service.title}</p>
								<p className="sc_rowMeta">
									<strong>
										{formatMoney(service.price, service.currency)}
									</strong>{' '}
									{service.pricingMode === 'fixed'
										? '· Fixed price'
										: PRICING_MODE_LABELS[service.pricingMode]}
									{service.durationMinutes
										? ` · ${service.durationMinutes} min`
										: ''}
								</p>
								{service.description && (
									<p className="sc_rowText">{service.description}</p>
								)}
							</div>
							<div className="flex shrink-0 gap-1">
								<button
									type="button"
									className="sc_iconAction"
									onClick={() => open(service)}
									aria-label={`Edit ${service.title}`}
								>
									<LuPencil aria-hidden="true" />
								</button>
								<button
									type="button"
									className="sc_iconAction"
									data-tone="danger"
									onClick={() => remove(service)}
									disabled={update.isPending}
									aria-label={`Remove ${service.title}`}
								>
									<LuTrash2 aria-hidden="true" />
								</button>
							</div>
						</ListRow>
					))}
				</ul>
			)}

			<ServiceModal
				refName={modalRef}
				service={editing}
				onSave={handleSave}
				isPending={update.isPending}
			/>
			<ConfirmModal refName={confirmRef} />
		</>
	);
}

ServicesTab.propTypes = {
	profile: PropTypes.object.isRequired,
};

export default ServicesTab;
