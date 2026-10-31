import React from 'react';
import { useSelector } from 'react-redux';
import {
	LuArrowRight,
	LuBadgeCheck,
	LuCreditCard,
	LuBriefcaseBusiness,
} from 'react-icons/lu';
import ProfileServices from '../../features/services/custom-hooks/profiles';
import SubscriptionServices from '../../features/services/custom-hooks/subscriptions';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { AppButton } from '../../components/button';
import {
	StatTileLink,
	AdminSection as Section,
} from '../../pages-admin/elements/index.style';
import { ROUTES } from '../../utilities/app-routes';
import { formatDate, humanize } from '../../utilities/basic-functions';
import { PROFILE_TYPES } from '../elements/profile-types';
import GoLive from '../elements/go-live';
import Activity from './elements/activity';

const greeting = () => {
	const hour = new Date().getHours();
	if (hour < 12) return 'Good morning';
	if (hour < 17) return 'Good afternoon';
	return 'Good evening';
};

// frontend-plan §B.1 — Dashboard home: profiles and plan at a glance,
// your activity (jobs waiting on you, messages, bids, orders…), then each
// profile's go-live steps.
function DashboardHome() {
	const { user } = useSelector((state) => state.auth);
	const { profiles, isPending } = ProfileServices.getMyProfiles();
	const subscription = SubscriptionServices.getCurrentSubscription();
	const owned = PROFILE_TYPES.filter((meta) => profiles[meta.type]);

	return (
		<>
			<PageHeader
				eyebrow="Dashboard"
				title={`${greeting()}, ${user?.fullName?.split(' ')[0] || 'there'}`}
				subtitle="What’s waiting on you, your profiles and your plan — at a glance."
			/>

			<Section aria-labelledby="glance-heading">
				<div className="sc_sectionHead">
					<h3 id="glance-heading" className="sc_sectionTitle">
						At a glance
					</h3>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<StatTileLink to={ROUTES.DASHBOARD_PROFILES}>
						<span className="sc_top">
							<span className="sc_label">Business profiles</span>
							<span className="sc_icon" aria-hidden="true">
								<LuBriefcaseBusiness />
							</span>
						</span>
						<span className="sc_value">{isPending ? '—' : owned.length}</span>
						<span className="sc_note inline-flex items-center gap-1.5">
							{owned.length ? 'Manage profiles' : 'Create your first'}
							<LuArrowRight aria-hidden="true" />
						</span>
					</StatTileLink>
					<StatTileLink to={ROUTES.DASHBOARD_VERIFICATION}>
						<span className="sc_top">
							<span className="sc_label">Verified</span>
							<span className="sc_icon" aria-hidden="true">
								<LuBadgeCheck />
							</span>
						</span>
						<span className="sc_value">
							{isPending
								? '—'
								: `${owned.filter((m) => profiles[m.type].isVerified).length} / ${owned.length}`}
						</span>
						<span className="sc_note inline-flex items-center gap-1.5">
							Verification center <LuArrowRight aria-hidden="true" />
						</span>
					</StatTileLink>
					<StatTileLink
						to={ROUTES.DASHBOARD_SUBSCRIPTION}
						$attention={
							!subscription.isPending && !subscription.data && owned.length > 0
						}
					>
						<span className="sc_top">
							<span className="sc_label">Plan</span>
							<span className="sc_icon" aria-hidden="true">
								<LuCreditCard />
							</span>
						</span>
						<span className="sc_value">
							{subscription.isPending
								? '—'
								: subscription.data
									? humanize(subscription.data.planTier)
									: 'None'}
						</span>
						<span className="sc_note inline-flex items-center gap-1.5">
							{subscription.data
								? `Until ${formatDate(subscription.data.expiresAt)}`
								: 'See plans'}
							<LuArrowRight aria-hidden="true" />
						</span>
					</StatTileLink>
				</div>
			</Section>

			<Activity />

			{owned.length > 0
				? owned.map((meta) => (
						<Section key={meta.type} aria-label={meta.label}>
							<div className="sc_sectionHead">
								<h3 className="sc_sectionTitle">
									{meta.label} · {meta.name(profiles[meta.type])}
								</h3>
								{meta.editor && (
									<AppButton
										size="sm"
										variant="secondary"
										to={meta.editor}
										icon={<LuArrowRight />}
									>
										Edit profile
									</AppButton>
								)}
							</div>
							<GoLive
								profileType={meta.type}
								profile={profiles[meta.type]}
								editTo={meta.editor || ROUTES.DASHBOARD_PROFILES}
							/>
						</Section>
					))
				: !isPending && (
						<Section aria-labelledby="start-heading">
							<div className="rounded-[18px] border border-dashed border-(--pg-card-border) p-6 md:p-8">
								<p className="font-label text-[11px] font-semibold tracking-[0.16em] text-(--pg-text-highlight) uppercase">
									Get started
								</p>
								<h3
									id="start-heading"
									className="font-display mt-1.5 text-2xl font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase"
								>
									Offer your services on PolyGrid
								</h3>
								<p className="mt-2 max-w-150 text-[15px] leading-relaxed text-(--pg-text-secondary)">
									Set up a business profile for the work you do — consultant,
									contractor, tradesperson, store or creator. Get verified, pick
									a plan, and you’re listed.
								</p>
								<div className="mt-5 flex flex-wrap gap-3">
									<AppButton
										to={ROUTES.DASHBOARD_CONSULTANCY}
										icon={<LuArrowRight />}
									>
										Become a consultant
									</AppButton>
									<AppButton variant="secondary" to={ROUTES.DASHBOARD_PROFILES}>
										See all profile types
									</AppButton>
								</div>
							</div>
						</Section>
					)}
		</>
	);
}

export default DashboardHome;
