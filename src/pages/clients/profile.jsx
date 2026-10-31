import React from 'react';
import { useParams } from 'react-router-dom';
import { LuBadgeCheck, LuMapPin, LuCalendar } from 'react-icons/lu';
import StoreServices from '../../features/services/custom-hooks/store';
import ProfileAvatar from '../../components/profile-avatar';
import RatingStars from '../../components/rating-stars';
import ReviewsBlock from '../../components/reviews';
import { Eyebrow } from '../home/elements/index.style';
import {
	ProfileHeader,
	ProfileSection,
} from '../engineering/profile/elements/index.style';
import { PROFILE_TYPE } from '../../utilities/app-const';
import { countryName } from '../../utilities/basic-functions';
import { ROUTES } from '../../utilities/app-routes';
import PublicPage from '../store/elements/page-states';

// frontend-plan §A.17 — a client's (poster's) reputation page, reached
// from a project / job / opening they posted. Never gated by
// verification or plan — only a ban hides it.
function ClientProfile() {
	const { id } = useParams();
	const query = StoreServices.getClient(id);

	return (
		<PublicPage
			query={query}
			noun="profile"
			browseTo={ROUTES.HOME}
			browseLabel="Back to PolyGrid"
		>
			{(client) => {
				const place = [client.city, countryName(client.country)]
					.filter(Boolean)
					.join(', ');
				return (
					<>
						<ProfileHeader>
							<div className="relative mx-auto w-full max-w-360 px-4 py-10 md:px-8 lg:py-14 xl:px-12">
								<div className="flex flex-col gap-6 sm:flex-row sm:items-start">
									<ProfileAvatar
										avatar={client.avatar}
										name={client.displayName}
										size={104}
									/>
									<div className="min-w-0">
										<Eyebrow>Client</Eyebrow>
										<h1 className="sc_headline mt-2">
											{client.displayName}
											{client.isVerified && (
												<LuBadgeCheck
													className="ml-2 inline align-[-4px] text-[30px] text-(--pg-status-success)"
													aria-label="Verified"
												/>
											)}
										</h1>
										<div className="sc_meta mt-4">
											<RatingStars
												value={client.ratingAverage}
												count={client.ratingCount}
											/>
											{place && (
												<span className="inline-flex items-center gap-1.5">
													<LuMapPin aria-hidden="true" /> {place}
												</span>
											)}
											{client.createdAt && (
												<span className="inline-flex items-center gap-1.5">
													<LuCalendar aria-hidden="true" /> On PolyGrid since{' '}
													{new Date(client.createdAt).getFullYear()}
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</ProfileHeader>
						<div className="mx-auto grid w-full max-w-360 gap-6 px-4 py-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:px-12">
							<ProfileSection>
								<h2 className="sc_sectionTitle">
									Reviews from contractors & workers
								</h2>
								<ReviewsBlock
									profileType={PROFILE_TYPE.CLIENT}
									profileId={client.id}
									ratingAverage={client.ratingAverage}
									ratingCount={client.ratingCount}
								/>
							</ProfileSection>
							{client.bio && (
								<ProfileSection>
									<h2 className="sc_sectionTitle">About</h2>
									<p className="sc_prose">{client.bio}</p>
								</ProfileSection>
							)}
						</div>
					</>
				);
			}}
		</PublicPage>
	);
}

export default ClientProfile;
