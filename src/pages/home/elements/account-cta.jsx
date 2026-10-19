import React from 'react';
import { LuArrowRight, LuArrowUpRight } from 'react-icons/lu';
import { AppButton } from '../../../components/button';
import StatsServices from '../../../features/services/custom-hooks/stats';
import { ROUTES } from '../../../utilities/app-routes';
import {
	Card,
	Chip,
	HeroGlow,
	LiveDot,
	PersonaRow,
	SectionTitle,
} from './index.style';

// Live boards band — frontend-plan §A.18 / §A.19's public counts, linking
// to the teaser pages (never to a specific listing).
export function LiveBoards() {
	const { data: tenders } = StatsServices.getTenderSummary();
	const { data: openings } = StatsServices.getJobOpeningSummary();
	const hasCounts = tenders?.totalOpen != null || openings?.totalOpen != null;

	return (
		<section className="mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-12">
			<Card className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex items-center gap-4">
					<LiveDot />
					<p className="font-display text-xl font-medium tracking-[0.02em] text-(--pg-text-primary) uppercase sm:text-2xl">
						{hasCounts ? (
							<>
								{tenders?.totalOpen != null &&
									`${tenders.totalOpen.toLocaleString()} open tenders`}
								{tenders?.totalOpen != null &&
									openings?.totalOpen != null &&
									' · '}
								{openings?.totalOpen != null &&
									`${openings.totalOpen.toLocaleString()} SiteForce openings`}
							</>
						) : (
							'New tenders and site jobs posted daily'
						)}
					</p>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					<AppButton
						to={ROUTES.TENDERS}
						variant="secondary"
						size="sm"
						icon={<LuArrowRight />}
					>
						View tenders
					</AppButton>
					<AppButton to={ROUTES.SITEFORCE} size="sm" icon={<LuArrowRight />}>
						Find site work
					</AppButton>
				</div>
			</Card>
		</section>
	);
}

// Illustration of the persona switch (frontend-plan §0): one account,
// several business profiles. Decorative only.
const PERSONAS = [
	{ title: 'Client', sub: 'Hiring & buying', active: true },
	{ title: 'Contractor', sub: 'Bidding on tenders', active: false },
	{ title: 'Store', sub: 'Selling materials', active: false },
];

export function AccountCta() {
	return (
		<section className="mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-12">
			<Card className="relative grid gap-10 overflow-hidden p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center xl:p-14">
				<HeroGlow />
				<div className="relative">
					<Chip $accent>One membership</Chip>
					<SectionTitle className="mt-6">
						Buy and sell from the same account.
					</SectionTitle>
					<p className="mt-5 max-w-xl text-[16px] leading-relaxed text-(--pg-text-secondary)">
						Switch between your personal side and your business profiles any
						time — hire a consultant in the morning, bid on a tender in the
						afternoon. One subscription keeps every business profile listed.
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<AppButton to={ROUTES.REGISTER} icon={<LuArrowUpRight />}>
							Create your account
						</AppButton>
						<AppButton to={ROUTES.ENGINEERING} variant="secondary">
							Browse as a guest
						</AppButton>
					</div>
				</div>

				<div
					className="relative flex flex-col gap-3 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-card) p-4"
					aria-hidden="true"
				>
					<p className="font-label px-1 text-[11px] font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
						Active profile
					</p>
					{PERSONAS.map(({ title, sub, active }) => (
						<PersonaRow key={title} $active={active}>
							<span className="flex flex-col">
								<span className="sc_title">{title}</span>
								<span className="sc_sub">{sub}</span>
							</span>
							<span className="sc_switch" />
						</PersonaRow>
					))}
				</div>
			</Card>
		</section>
	);
}
