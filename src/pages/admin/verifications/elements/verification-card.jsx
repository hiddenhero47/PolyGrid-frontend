import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
	LuMail,
	LuMapPin,
	LuClock,
	LuFileText,
	LuImage,
	LuExternalLink,
	LuCheck,
	LuX,
	LuCreditCard,
} from 'react-icons/lu';
import AdminServices from '../../../../features/services/custom-hooks/admin';
import ProfileAvatar from '../../../../components/profile-avatar';
import StatusBadge from '../../../../components/status-badge';
import { AppButton } from '../../../../components/button';
import { Chip } from '../../../home/elements/index.style';
import {
	PROFILE_TYPE,
	PROFILE_TYPE_LABELS,
	VERIFICATION_STATUS,
} from '../../../../utilities/app-const';
import {
	countryName,
	formatDate,
	humanize,
} from '../../../../utilities/basic-functions';
import { consultantPath, ROUTES } from '../../../../utilities/app-routes';
import { ReviewCard, DocChip } from './index.style';

const VERIFICATION_BADGES = {
	pending: { label: 'Pending', tone: 'warning' },
	approved: { label: 'Approved', tone: 'success' },
	rejected: { label: 'Rejected', tone: 'error' },
};

const fileSize = (bytes) => {
	if (!bytes) return '';
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Only consultants have a public page so far — other pillars come later.
const publicProfilePath = (verification) =>
	verification.profileType === PROFILE_TYPE.CONSULTANCY
		? consultantPath({ id: verification.profileId })
		: null;

// Form answers are template-driven (VerificationTemplate), so keys are
// shown humanized: fullName → Full Name.
const formEntries = (form = {}) =>
	Object.entries(form).filter(
		([, value]) => value !== '' && value != null && typeof value !== 'object'
	);

function VerificationCard({
	verification,
	canManage,
	onApprove,
	onReject,
	busy,
}) {
	const fileLink = AdminServices.getFileLink();
	const user = verification.user || {};
	const ownerId = user._id || verification.user;
	const location = [
		verification.location?.state,
		countryName(verification.location?.country),
	]
		.filter(Boolean)
		.join(', ');
	const profilePath = publicProfilePath(verification);
	const isPending = verification.status === VERIFICATION_STATUS.PENDING;

	// The signed link is fetched on click; the tab is opened first so popup
	// blockers allow it, then pointed at the file.
	const openDocument = (doc) => {
		const tab = window.open('', '_blank');
		fileLink.mutate(
			{ ownerId, fileName: doc.fileName },
			{
				onSuccess: ({ requestUrl }) => {
					if (tab) {
						tab.opener = null;
						tab.location.href = requestUrl;
					} else {
						window.open(requestUrl, '_blank', 'noopener');
					}
				},
				onError: () => tab?.close(),
			}
		);
	};

	return (
		<ReviewCard aria-labelledby={`verification-${verification._id}`}>
			<div className="sc_who">
				<ProfileAvatar name={user.fullName} size={48} />
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2.5">
						<h3 id={`verification-${verification._id}`} className="sc_name">
							{user.fullName || 'Unknown user'}
						</h3>
						<Chip $accent>
							{PROFILE_TYPE_LABELS[verification.profileType] ||
								verification.profileType}
						</Chip>
					</div>
					<div className="sc_meta">
						{user.email && (
							<span>
								<LuMail aria-hidden="true" /> {user.email}
							</span>
						)}
						{location && (
							<span>
								<LuMapPin aria-hidden="true" /> {location}
							</span>
						)}
						<span>
							<LuClock aria-hidden="true" /> Submitted{' '}
							{formatDate(
								verification.submittedAt || verification.createdAt,
								true
							)}
						</span>
					</div>
				</div>
				<StatusBadge status={verification.status} map={VERIFICATION_BADGES} />
			</div>

			{formEntries(verification.form).length > 0 && (
				<dl className="sc_details">
					{formEntries(verification.form).map(([key, value]) => (
						<div key={key}>
							<dt className="sc_term">
								{humanize(key.replace(/([a-z])([A-Z])/g, '$1 $2'))}
							</dt>
							<dd className="sc_def">{String(value)}</dd>
						</div>
					))}
				</dl>
			)}

			{verification.documents?.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{verification.documents.map((doc) => (
						<DocChip
							key={doc.fileName}
							type="button"
							onClick={() => openDocument(doc)}
							disabled={!canManage || fileLink.isPending}
							title={
								canManage
									? 'Open in a new tab'
									: 'Only admins can open documents'
							}
						>
							{doc.mime?.startsWith('image/') ? (
								<LuImage className="sc_docIcon" aria-hidden="true" />
							) : (
								<LuFileText className="sc_docIcon" aria-hidden="true" />
							)}
							{humanize(doc.type)}
							<span className="sc_size">{fileSize(doc.size)}</span>
							{canManage && <LuExternalLink aria-hidden="true" />}
						</DocChip>
					))}
				</div>
			)}

			{verification.status === VERIFICATION_STATUS.REJECTED &&
				verification.rejectionReason && (
					<p className="rounded-xl bg-(--pg-status-errorSoft) px-4 py-3 text-[15px] text-(--pg-text-primary)">
						<span className="font-semibold">Rejected: </span>
						{verification.rejectionReason}
					</p>
				)}

			<div className="sc_actions">
				{profilePath && (
					<Link
						to={profilePath}
						target="_blank"
						className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--pg-text-link) hover:underline"
					>
						Public profile <LuExternalLink aria-hidden="true" />
					</Link>
				)}
				{verification.reviewedAt && (
					<span className="text-sm text-(--pg-text-secondary)">
						Reviewed {formatDate(verification.reviewedAt, true)}
					</span>
				)}

				<div className="ml-auto flex flex-wrap gap-2.5">
					{canManage &&
						verification.status === VERIFICATION_STATUS.APPROVED && (
							<AppButton
								size="sm"
								variant="secondary"
								icon={<LuCreditCard />}
								to={`${ROUTES.ADMIN_SUBSCRIPTIONS}?userId=${ownerId}`}
							>
								Grant a plan
							</AppButton>
						)}
					{canManage && isPending && (
						<>
							<AppButton
								size="sm"
								variant="secondary"
								icon={<LuX />}
								onClick={() => onReject(verification)}
								disabled={busy}
							>
								Reject
							</AppButton>
							<AppButton
								size="sm"
								icon={<LuCheck />}
								onClick={() => onApprove(verification)}
								disabled={busy}
							>
								{busy ? 'Approving…' : 'Approve'}
							</AppButton>
						</>
					)}
				</div>
			</div>
		</ReviewCard>
	);
}

VerificationCard.propTypes = {
	verification: PropTypes.object.isRequired,
	canManage: PropTypes.bool,
	onApprove: PropTypes.func,
	onReject: PropTypes.func,
	busy: PropTypes.bool,
};

export default VerificationCard;
