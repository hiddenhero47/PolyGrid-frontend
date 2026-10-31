import React from 'react';
import PropTypes from 'prop-types';
import { LuFileText } from 'react-icons/lu';
import StatusBadge from '../../../components/status-badge';
import { formatDate, humanize } from '../../../utilities/basic-functions';

const BADGES = {
	pending: { label: 'Under review', tone: 'warning' },
	approved: { label: 'Approved', tone: 'success' },
	rejected: { label: 'Rejected', tone: 'error' },
};

const docLabel = (template, type) =>
	template?.documents?.find((d) => d.type === type)?.label || humanize(type);

// Every past submission for this profile, newest first — nothing is ever
// overwritten, so old rejections stay visible with their reasons.
function VerificationHistory({ items = [] }) {
	if (!items.length) {
		return (
			<p className="text-[15px] text-(--pg-text-secondary)">
				No submissions yet for this profile.
			</p>
		);
	}

	return (
		<ol className="flex flex-col gap-3">
			{items.map((item) => {
				const template =
					typeof item.templateId === 'object' ? item.templateId : null;
				return (
					<li
						key={item._id}
						className="rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-4"
					>
						<div className="flex flex-wrap items-center justify-between gap-3">
							<span className="text-[15px] font-semibold text-(--pg-text-primary)">
								Submitted {formatDate(item.submittedAt || item.createdAt, true)}
							</span>
							<StatusBadge status={item.status} map={BADGES} />
						</div>
						{item.documents?.length > 0 && (
							<p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--pg-text-secondary)">
								{item.documents.map((doc) => (
									<span
										key={doc.fileName}
										className="inline-flex items-center gap-1.5"
									>
										<LuFileText aria-hidden="true" />{' '}
										{docLabel(template, doc.type)}
									</span>
								))}
							</p>
						)}
						{item.status === 'rejected' && item.rejectionReason && (
							<p className="mt-3 rounded-xl bg-(--pg-status-errorSoft) px-3.5 py-2.5 text-[14.5px] text-(--pg-text-primary)">
								<span className="font-semibold">Reason: </span>
								{item.rejectionReason}
							</p>
						)}
						{item.reviewedAt && (
							<p className="mt-2 text-sm text-(--pg-text-secondary)">
								Reviewed {formatDate(item.reviewedAt, true)}
							</p>
						)}
					</li>
				);
			})}
		</ol>
	);
}

VerificationHistory.propTypes = {
	items: PropTypes.array,
};

export default VerificationHistory;
