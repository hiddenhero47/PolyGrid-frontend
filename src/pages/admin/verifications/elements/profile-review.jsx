import React from 'react';
import PropTypes from 'prop-types';
import {
	LuMapPin,
	LuBriefcase,
	LuCalendar,
	LuExternalLink,
	LuCloudOff,
	LuRotateCw,
	LuImage,
} from 'react-icons/lu';
import AdminServices from '../../../../features/services/custom-hooks/admin';
import AppLoader from '../../../../components/loader';
import EmptyState from '../../../../components/empty-state';
import ProfileAvatar from '../../../../components/profile-avatar';
import StatusBadge from '../../../../components/status-badge';
import { AppButton } from '../../../../components/button';
import { Chip } from '../../../home/elements/index.style';
import {
	PROFILE_TYPE,
	PROFILE_TYPE_LABELS,
	SPECIALIZATION_LABELS,
	PRICING_MODE_LABELS,
} from '../../../../utilities/app-const';
import {
	countryName,
	formatDate,
	formatMoney,
	humanize,
} from '../../../../utilities/basic-functions';
import {
	consultantPath,
	contractorPath,
} from '../../../../utilities/app-routes';

// Pillars with a public page so far.
const PUBLIC_PATHS = {
	[PROFILE_TYPE.CONSULTANCY]: consultantPath,
	[PROFILE_TYPE.CONTRACTOR]: contractorPath,
};

// Every pillar names itself with one of these, never more than one.
const profileName = (p) =>
	p.headline || p.displayName || p.storeName || 'Untitled profile';

// The "what they do" list differs per pillar.
const disciplines = (p) =>
	[
		...(p.specializations || []).map(
			(s) => SPECIALIZATION_LABELS[s] || humanize(s)
		),
		...[].concat(p.specialty || []).map(humanize),
		...(p.skills || []).map(humanize),
		...(p.categories || []).map(humanize),
	].filter(Boolean);

const Heading = ({ children }) => (
	<h4 className="font-label mb-2.5 text-[11px] font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
		{children}
	</h4>
);
Heading.propTypes = { children: PropTypes.node };

// The profile behind a verification, as the reviewer needs to see it —
// GET /api/admin/profiles/:profileType/:id ignores the public page's
// verified/subscribed gating. Generic across pillars: shows whichever of
// the common sections this profile type has.
function ProfileReview({ profileType, profileId }) {
	const {
		data: p,
		isPending,
		isError,
		refetch,
	} = AdminServices.getProfileForReview({
		profileType,
		id: profileId,
	});

	if (isPending) return <AppLoader showLabel label="Loading profile" />;
	if (isError) {
		return (
			<EmptyState
				compact
				tone="error"
				icon={<LuCloudOff />}
				title="Couldn’t load this profile"
				actions={
					<AppButton size="sm" icon={<LuRotateCw />} onClick={() => refetch()}>
						Retry
					</AppButton>
				}
			/>
		);
	}

	const place = [p.city, countryName(p.country)].filter(Boolean).join(', ');
	const tags = disciplines(p);
	const images = (p.portfolio || []).flatMap((item) =>
		(item.media || []).map((m) => ({ ...m, title: item.title }))
	);

	return (
		<div className="flex flex-col gap-7">
			<div className="flex items-start gap-4">
				<ProfileAvatar avatar={p.avatar} name={profileName(p)} size={64} />
				<div className="min-w-0">
					<p className="font-label text-[11px] font-semibold tracking-[0.16em] text-(--pg-text-highlight) uppercase">
						{PROFILE_TYPE_LABELS[profileType] || profileType}
					</p>
					<h3 className="font-display mt-1 text-[22px] leading-tight font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase">
						{profileName(p)}
					</h3>
					<div className="mt-2 flex flex-wrap gap-2">
						<StatusBadge
							label={p.isVerified ? 'Verified' : 'Not verified'}
							tone={p.isVerified ? 'success' : 'warning'}
						/>
						<StatusBadge
							label={humanize(
								p.status === 'inactive' ? 'on a break' : p.status
							)}
							tone={
								p.status === 'banned'
									? 'error'
									: p.status === 'active'
										? 'neutral'
										: 'warning'
							}
						/>
					</div>
				</div>
			</div>

			<div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-(--pg-text-secondary)">
				{place && (
					<span className="inline-flex items-center gap-1.5">
						<LuMapPin aria-hidden="true" /> {place}
					</span>
				)}
				{p.yearsOfExperience != null && (
					<span className="inline-flex items-center gap-1.5">
						<LuBriefcase aria-hidden="true" /> {p.yearsOfExperience} years’
						experience
					</span>
				)}
				{p.createdAt && (
					<span className="inline-flex items-center gap-1.5">
						<LuCalendar aria-hidden="true" /> Created {formatDate(p.createdAt)}
					</span>
				)}
			</div>

			{tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{tags.map((tag) => (
						<Chip key={tag}>{tag}</Chip>
					))}
				</div>
			)}

			{p.bio && (
				<section>
					<Heading>About</Heading>
					<p className="text-[15px] leading-relaxed whitespace-pre-line text-(--pg-text-primary)">
						{p.bio}
					</p>
				</section>
			)}

			{p.services?.length > 0 && (
				<section>
					<Heading>Services</Heading>
					<ul className="flex flex-col divide-y divide-(--pg-card-border) rounded-xl border border-(--pg-card-border)">
						{p.services.map((service) => (
							<li key={service._id || service.title} className="px-4 py-3">
								<p className="font-semibold text-(--pg-text-primary)">
									{service.title}
								</p>
								<p className="text-sm text-(--pg-text-secondary)">
									{formatMoney(service.price, service.currency)}{' '}
									{service.pricingMode === 'fixed'
										? '· Fixed price'
										: PRICING_MODE_LABELS[service.pricingMode]}
								</p>
							</li>
						))}
					</ul>
				</section>
			)}

			{p.mentorship?.isMentor && (
				<section>
					<Heading>Mentorship</Heading>
					{p.mentorship.bio && (
						<p className="text-[15px] text-(--pg-text-primary)">
							{p.mentorship.bio}
						</p>
					)}
					{p.mentorship.areas?.length > 0 && (
						<p className="mt-1.5 text-sm text-(--pg-text-secondary)">
							{p.mentorship.areas.join(' · ')}
						</p>
					)}
				</section>
			)}

			{(p.portfolio?.length > 0 || images.length > 0) && (
				<section>
					<Heading>
						Portfolio · {p.portfolio.length} project
						{p.portfolio.length === 1 ? '' : 's'}
					</Heading>
					{images.length > 0 ? (
						<ul className="grid grid-cols-3 gap-2">
							{images.slice(0, 9).map((img) => (
								<li key={img.fileName}>
									<a
										href={img.url}
										target="_blank"
										rel="noopener noreferrer"
										title={img.title}
										className="block aspect-square overflow-hidden rounded-lg bg-(--pg-surface-elevated)"
									>
										<img
											src={img.url}
											alt={img.title}
											loading="lazy"
											className="h-full w-full object-cover"
										/>
									</a>
								</li>
							))}
						</ul>
					) : (
						<p className="inline-flex items-center gap-2 text-sm text-(--pg-text-secondary)">
							<LuImage aria-hidden="true" /> No images uploaded
						</p>
					)}
				</section>
			)}

			{p.links?.length > 0 && (
				<section>
					<Heading>Links</Heading>
					<ul className="flex flex-col gap-1.5">
						{p.links.map((link) => (
							<li key={link.url}>
								<a
									href={link.url}
									target="_blank"
									rel="noopener noreferrer nofollow"
									className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-(--pg-text-link) hover:underline"
								>
									{link.label} <LuExternalLink aria-hidden="true" />
								</a>
								<span className="ml-2 text-sm break-all text-(--pg-text-secondary)">
									{link.url}
								</span>
							</li>
						))}
					</ul>
				</section>
			)}

			{PUBLIC_PATHS[profileType] && (
				<p className="text-sm text-(--pg-text-secondary)">
					Public page:{' '}
					<a
						href={PUBLIC_PATHS[profileType](p)}
						target="_blank"
						rel="noopener noreferrer"
						className="font-semibold text-(--pg-text-link) hover:underline"
					>
						{PUBLIC_PATHS[profileType](p)}
					</a>{' '}
					— shows only once verified and subscribed.
				</p>
			)}
		</div>
	);
}

ProfileReview.propTypes = {
	profileType: PropTypes.string.isRequired,
	profileId: PropTypes.string.isRequired,
};

export default ProfileReview;
