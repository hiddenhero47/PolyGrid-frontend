import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
	LuArrowLeft,
	LuBadgeCheck,
	LuMapPin,
	LuCalendar,
	LuExternalLink,
	LuFiles,
} from 'react-icons/lu';
import StoreServices from '../../features/services/custom-hooks/store';
import ProfileAvatar from '../../components/profile-avatar';
import RatingStars from '../../components/rating-stars';
import ReviewsBlock from '../../components/reviews';
import Pagination from '../../components/pagination';
import EmptyState from '../../components/empty-state';
import { Eyebrow } from '../home/elements/index.style';
import {
	ProfileHeader,
	ProfileSection,
} from '../engineering/profile/elements/index.style';
import { PROFILE_TYPE } from '../../utilities/app-const';
import { countryName } from '../../utilities/basic-functions';
import { ROUTES } from '../../utilities/app-routes';
import PublicPage from './elements/page-states';
import { DigitalCard } from './elements/product-cards';

const LIMIT = 12;

// frontend-plan §A.13 — a creator's storefront: who they are and their
// approved, on-sale files. (The backend's list includes files still
// awaiting review; those are filtered out here until it stops sending
// them.) URL: ?page=
function CreatorPage() {
	const { idOrSlug } = useParams();
	const [params, setParams] = useSearchParams();
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const query = StoreServices.getCreator(idOrSlug, { page, limit: LIMIT });

	return (
		<PublicPage
			query={query}
			noun="creator"
			browseTo={ROUTES.DIGITAL_STORE}
			browseLabel="Browse digital files"
		>
			{(creator) => {
				const place = [creator.city, countryName(creator.country)]
					.filter(Boolean)
					.join(', ');
				const products = (creator.products || []).filter(
					(p) => p.isVerified !== false
				);
				return (
					<>
						<ProfileHeader>
							<div className="relative mx-auto w-full max-w-[1440px] px-4 py-10 md:px-8 lg:py-14 xl:px-12">
								<Link
									to={ROUTES.DIGITAL_STORE}
									className="font-label mb-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
								>
									<LuArrowLeft aria-hidden="true" /> Digital files
								</Link>
								<div className="flex flex-col gap-6 sm:flex-row sm:items-start">
									<ProfileAvatar
										avatar={creator.avatar}
										name={creator.displayName}
										size={104}
									/>
									<div className="min-w-0">
										<Eyebrow>Digital creator</Eyebrow>
										<h1 className="sc_headline mt-2">
											{creator.displayName}
											{creator.isVerified && (
												<LuBadgeCheck
													className="ml-2 inline align-[-4px] text-[30px] text-(--pg-status-success)"
													aria-label="Verified"
												/>
											)}
										</h1>
										<div className="sc_meta mt-4">
											<RatingStars
												value={creator.ratingAverage}
												count={creator.ratingCount}
											/>
											{place && (
												<span className="inline-flex items-center gap-1.5">
													<LuMapPin aria-hidden="true" /> {place}
												</span>
											)}
											{creator.createdAt && (
												<span className="inline-flex items-center gap-1.5">
													<LuCalendar aria-hidden="true" /> On PolyGrid since{' '}
													{new Date(creator.createdAt).getFullYear()}
												</span>
											)}
										</div>
										{creator.bio && (
											<p className="mt-5 max-w-[720px] text-[15.5px] leading-relaxed text-(--pg-text-secondary)">
												{creator.bio}
											</p>
										)}
									</div>
								</div>
							</div>
						</ProfileHeader>

						<div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-10 md:px-8 xl:px-12">
							<section
								aria-labelledby="files-heading"
								className="flex flex-col gap-5"
							>
								<h2
									id="files-heading"
									className="font-display text-2xl font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase"
								>
									Files
								</h2>
								{products.length ? (
									<ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
										{products.map((product) => (
											<li key={product.id}>
												<DigitalCard product={product} />
											</li>
										))}
									</ul>
								) : (
									<EmptyState
										compact
										icon={<LuFiles />}
										title="No files on sale yet"
									/>
								)}
								{creator.pagination?.totalPages > 1 && (
									<Pagination
										pagination={creator.pagination}
										changePage={(next) =>
											setParams(next > 1 ? { page: String(next) } : {})
										}
									/>
								)}
							</section>

							<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
								<ProfileSection>
									<h2 className="sc_sectionTitle">Reviews</h2>
									<ReviewsBlock
										profileType={PROFILE_TYPE.DIGITAL_CREATOR}
										profileId={creator.id}
										ratingAverage={creator.ratingAverage}
										ratingCount={creator.ratingCount}
									/>
								</ProfileSection>
								{creator.links?.length > 0 && (
									<ProfileSection>
										<h2 className="sc_sectionTitle">Links</h2>
										<ul className="flex flex-col gap-2">
											{creator.links.map((link) => (
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
							</div>
						</div>
					</>
				);
			}}
		</PublicPage>
	);
}

export default CreatorPage;
