import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuStar, LuMapPin } from 'react-icons/lu';
import { AppButton } from '../../../components/button';
import StatsServices from '../../../features/services/custom-hooks/stats';
import { PROFILE_TYPE } from '../../../utilities/app-const';
import { ROUTES } from '../../../utilities/app-routes';
import {
	Avatar,
	Card,
	Eyebrow,
	SectionTitle,
	Skeleton,
	Tabs,
} from './index.style';

// frontend-plan §A.1a — GET /api/stats/top-profiles, one tab per type.
const TABS = [
	{ label: 'Consultants', type: PROFILE_TYPE.CONSULTANCY },
	{ label: 'Contractors', type: PROFILE_TYPE.CONTRACTOR },
	{ label: 'Tradespeople', type: PROFILE_TYPE.LABOR },
	{ label: 'Stores', type: PROFILE_TYPE.STORE },
	{ label: 'Creators', type: PROFILE_TYPE.DIGITAL_CREATOR },
];

const LIMIT = 4;

// Each profile type names itself with one of these (statsController.ts).
const profileName = (profile) =>
	profile.displayName ||
	profile.storeName ||
	profile.headline ||
	'PolyGrid member';

const initials = (name) =>
	name
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => word[0])
		.join('');

const countryName = (code) => {
	try {
		return new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
	} catch {
		return code;
	}
};

function ProfileCard({ profile, typeLabel }) {
	const name = profileName(profile);
	return (
		<Card $hoverable className="flex flex-col gap-5 p-5">
			<div className="flex items-center gap-4">
				<Avatar aria-hidden="true">{initials(name)}</Avatar>
				<div className="min-w-0">
					<p className="font-label text-[11px] font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
						{typeLabel}
					</p>
					<p className="font-display mt-1 truncate text-xl font-medium tracking-[0.02em] text-(--pg-text-primary) uppercase">
						{name}
					</p>
				</div>
			</div>
			<div className="flex items-center justify-between gap-3 text-[15px] text-(--pg-text-secondary)">
				<span className="flex items-center gap-1.5">
					<LuStar className="fill-current text-(--pg-status-warning)" />
					<span className="font-semibold text-(--pg-text-primary)">
						{Number(profile.ratingAverage || 0).toFixed(1)}
					</span>
					({profile.ratingCount || 0})
				</span>
				{profile.country && (
					<span className="flex items-center gap-1.5 truncate">
						<LuMapPin />
						{countryName(profile.country)}
					</span>
				)}
			</div>
		</Card>
	);
}

ProfileCard.propTypes = {
	profile: PropTypes.object.isRequired,
	typeLabel: PropTypes.string.isRequired,
};

function TopRated() {
	const [active, setActive] = useState(TABS[0]);
	const { data, isPending, isError } = StatsServices.getTopProfiles({
		profileType: active.type,
		limit: LIMIT,
	});
	const profiles = data?.data ?? [];

	return (
		<section className="mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-12">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<Eyebrow>Top rated · verified</Eyebrow>
					<SectionTitle className="mt-3">Trusted on PolyGrid</SectionTitle>
				</div>
				<Tabs role="tablist" aria-label="Profile type">
					{TABS.map((tab) => (
						<button
							key={tab.type}
							type="button"
							role="tab"
							className="sc_tab"
							aria-selected={tab.type === active.type}
							onClick={() => setActive(tab)}
						>
							{tab.label}
						</button>
					))}
				</Tabs>
			</div>

			<div
				className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
				role="tabpanel"
			>
				{isPending &&
					Array.from({ length: LIMIT }, (_, i) => (
						<Card key={i} className="flex flex-col gap-5 p-5">
							<div className="flex items-center gap-4">
								<Skeleton $radius={14} className="h-14 w-14" />
								<div className="flex flex-1 flex-col gap-2">
									<Skeleton className="h-3 w-1/2" />
									<Skeleton className="h-5 w-3/4" />
								</div>
							</div>
							<Skeleton className="h-4 w-full" />
						</Card>
					))}

				{!isPending &&
					profiles.map((profile) => (
						<ProfileCard
							key={profile.id}
							profile={profile}
							typeLabel={active.label}
						/>
					))}

				{!isPending && (isError || profiles.length === 0) && (
					<Card className="flex flex-col items-start gap-4 p-6 sm:col-span-2 xl:col-span-4">
						<p className="font-display text-2xl font-medium tracking-[0.02em] text-(--pg-text-primary) uppercase">
							No top-rated {active.label.toLowerCase()} yet
						</p>
						<p className="max-w-lg text-[14px] text-(--pg-text-secondary)">
							Ratings come from completed work on PolyGrid. Set up your profile
							and be among the first to earn them.
						</p>
						<AppButton to={ROUTES.REGISTER} size="sm" variant="secondary">
							Create a profile
						</AppButton>
					</Card>
				)}
			</div>
		</section>
	);
}

export default TopRated;
