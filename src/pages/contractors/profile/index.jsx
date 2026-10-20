import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuArrowLeft,
	LuBadgeCheck,
	LuMapPin,
	LuBriefcase,
	LuCalendar,
	LuExternalLink,
	LuCoffee,
	LuSearchX,
	LuCloudOff,
	LuRotateCw,
	LuLogIn,
	LuHardHat,
} from 'react-icons/lu';
import ContractorServices from '../../../features/services/custom-hooks/contractors';
import { selectIsAuthenticated } from '../../../store/slice/auth';
import ProfileAvatar from '../../../components/profile-avatar';
import RatingStars from '../../../components/rating-stars';
import ReviewsBlock from '../../../components/reviews';
import AppLoader from '../../../components/loader';
import EmptyState from '../../../components/empty-state';
import UnavailableState from '../../../components/empty-state/unavailable-state';
import { AppButton } from '../../../components/button';
import { Chip, Eyebrow } from '../../home/elements/index.style';
import Portfolio from '../../engineering/profile/elements/portfolio';
import {
	ProfileHeader,
	ProfileSection,
} from '../../engineering/profile/elements/index.style';
import { PROFILE_TYPE } from '../../../utilities/app-const';
import {
	countryName,
	specialtyLabel,
} from '../../../utilities/basic-functions';
import { ROUTES } from '../../../utilities/app-routes';

// frontend-plan §A.8 — a contractor's public page: same shape as the
// consultant's (§A.6) — portfolio and reviews — without services or
// mentorship. GET /api/contractor-profiles/:idOrSlug answers the profile,
// { available: false } (UnavailableState), or 404.
function ContractorProfile() {
	const { idOrSlug } = useParams();
	const location = useLocation();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const {
		data: profile,
		isPending,
		isError,
		error,
		refetch,
	} = ContractorServices.getProfile(idOrSlug);

	const wrap = (content) => (
		<div className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-8 xl:px-12">
			{content}
		</div>
	);

	if (isPending)
		return wrap(<AppLoader fullPage showLabel label="Loading profile" />);

	if (isError) {
		const notFound = error?.response?.status === 404;
		return wrap(
			notFound ? (
				<EmptyState
					icon={<LuSearchX />}
					eyebrow="404"
					title="Contractor not found"
					text="This link doesn’t match any contractor on PolyGrid. It may have been mistyped."
					actions={
						<AppButton to={ROUTES.CONTRACTORS}>Browse contractors</AppButton>
					}
				/>
			) : (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load this profile"
					text="Check your connection and try again."
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
							Retry
						</AppButton>
					}
					role="alert"
				/>
			)
		);
	}

	if (profile?.available === false) {
		return wrap(
			<UnavailableState
				message={profile.message}
				browseTo={ROUTES.CONTRACTORS}
				browseLabel="Browse contractors"
			/>
		);
	}

	const place = [profile.city, countryName(profile.country)]
		.filter(Boolean)
		.join(', ');
	const onBreak = profile.status === 'inactive';

	return (
		<>
			<ProfileHeader>
				<div className="relative mx-auto w-full max-w-[1440px] px-4 py-10 md:px-8 lg:py-14 xl:px-12">
					<Link
						to={ROUTES.CONTRACTORS}
						className="font-label mb-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
					>
						<LuArrowLeft aria-hidden="true" /> All contractors
					</Link>

					<div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
						<div className="flex flex-col gap-6 sm:flex-row sm:items-start">
							<ProfileAvatar
								avatar={profile.avatar}
								name={profile.headline}
								size={104}
							/>
							<div className="min-w-0">
								<Eyebrow>Contractor</Eyebrow>
								<h1 className="sc_headline mt-2">
									{profile.headline}
									{profile.isVerified && (
										<LuBadgeCheck
											className="ml-2 inline align-[-4px] text-[30px] text-(--pg-status-success)"
											aria-label="Verified"
										/>
									)}
								</h1>
								<div className="sc_meta mt-4">
									<RatingStars
										value={profile.ratingAverage}
										count={profile.ratingCount}
									/>
									{place && (
										<span className="inline-flex items-center gap-1.5">
											<LuMapPin aria-hidden="true" /> {place}
										</span>
									)}
									{profile.yearsOfExperience != null && (
										<span className="inline-flex items-center gap-1.5">
											<LuBriefcase aria-hidden="true" />{' '}
											{profile.yearsOfExperience} years’ experience
										</span>
									)}
									{profile.createdAt && (
										<span className="inline-flex items-center gap-1.5">
											<LuCalendar aria-hidden="true" /> On PolyGrid since{' '}
											{new Date(profile.createdAt).getFullYear()}
										</span>
									)}
								</div>
								<div className="mt-5 flex flex-wrap gap-2">
									{profile.specialties?.map((s) => (
										<Chip key={s}>{specialtyLabel(s)}</Chip>
									))}
								</div>
							</div>
						</div>

						{/* Hiring is a Job (Phase 3) — until then, sign-in is the step */}
						<div className="flex flex-col gap-3 lg:items-end">
							{isAuthenticated ? (
								<>
									<AppButton disabled>Request a job</AppButton>
									<span className="text-sm text-(--pg-text-secondary)">
										Hiring through PolyGrid opens soon.
									</span>
								</>
							) : (
								<AppButton
									to={ROUTES.LOGIN}
									state={{ from: location.pathname }}
									icon={<LuLogIn />}
								>
									Sign in to hire
								</AppButton>
							)}
						</div>
					</div>
				</div>
			</ProfileHeader>

			<div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:px-12">
				<div className="flex min-w-0 flex-col gap-6">
					{onBreak && (
						<div className="flex items-center gap-3 rounded-xl border border-(--pg-card-border) bg-(--pg-status-warningSoft) p-4 text-[15px] text-(--pg-text-primary)">
							<LuCoffee
								className="shrink-0 text-(--pg-status-warning)"
								aria-hidden="true"
							/>
							On a break — not taking new work right now.
						</div>
					)}

					{profile.bio && (
						<ProfileSection>
							<h2 className="sc_sectionTitle">About</h2>
							<p className="sc_prose">{profile.bio}</p>
						</ProfileSection>
					)}

					<ProfileSection>
						<h2 className="sc_sectionTitle">Past projects</h2>
						{profile.portfolio?.length > 0 ? (
							<Portfolio items={profile.portfolio} />
						) : (
							<p className="sc_prose">No projects listed yet.</p>
						)}
					</ProfileSection>

					<ProfileSection>
						<h2 className="sc_sectionTitle">Reviews</h2>
						<ReviewsBlock
							profileType={PROFILE_TYPE.CONTRACTOR}
							profileId={profile.id}
							ratingAverage={profile.ratingAverage}
							ratingCount={profile.ratingCount}
						/>
					</ProfileSection>
				</div>

				<aside className="flex flex-col gap-6">
					<ProfileSection>
						<h2 className="sc_sectionTitle inline-flex items-center gap-2">
							<LuHardHat aria-hidden="true" /> Work with them
						</h2>
						<p className="sc_prose">
							Hire this contractor directly for a job, or post your project to
							the sealed tender board and let verified contractors bid.
						</p>
						<div className="mt-4 flex flex-wrap gap-3">
							<AppButton size="sm" variant="secondary" to={ROUTES.TENDERS}>
								About tenders
							</AppButton>
						</div>
					</ProfileSection>

					{profile.links?.length > 0 && (
						<ProfileSection>
							<h2 className="sc_sectionTitle">Links</h2>
							<ul className="flex flex-col gap-2">
								{profile.links.map((link) => (
									<li key={link.url}>
										<a
											href={link.url}
											target="_blank"
											rel="noopener noreferrer nofollow"
											className="inline-flex items-center gap-2 font-semibold text-(--pg-text-link) hover:underline"
										>
											{link.label} <LuExternalLink aria-hidden="true" />
										</a>
									</li>
								))}
							</ul>
						</ProfileSection>
					)}
				</aside>
			</div>
		</>
	);
}

export default ContractorProfile;
