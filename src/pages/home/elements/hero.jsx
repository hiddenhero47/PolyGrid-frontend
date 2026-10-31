import React from 'react';
import {
	LuArrowUpRight,
	LuArrowDown,
	LuShieldCheck,
	LuLockKeyhole,
	LuBadgeCheck,
} from 'react-icons/lu';
import { AppButton } from '../../../components/button';
import StatsServices from '../../../features/services/custom-hooks/stats';
import { ROUTES } from '../../../utilities/app-routes';
import heroImage from '../../../assets/images/home/hero-bridge.jpg';
import {
	Card,
	Chip,
	GlassNote,
	GlassTag,
	HeroGlow,
	HeroTitle,
	IconBox,
	ImagePanel,
	LiveDot,
} from './index.style';

// Live counts from the public teaser endpoints. Shown only once they've
// loaded — never a made-up number.
function LiveCounts() {
	const { data: tenders } = StatsServices.getTenderSummary();
	const { data: openings } = StatsServices.getJobOpeningSummary();

	if (tenders?.totalOpen == null && openings?.totalOpen == null) return null;

	return (
		<GlassTag>
			<span className="sc_label">Open right now</span>
			<span className="sc_value">
				{tenders?.totalOpen != null && (
					<>
						{tenders.totalOpen.toLocaleString()}{' '}
						<span className="sc_accent">tenders</span>
					</>
				)}
				{tenders?.totalOpen != null && openings?.totalOpen != null && ' · '}
				{openings?.totalOpen != null && (
					<>
						{openings.totalOpen.toLocaleString()}{' '}
						<span className="sc_accent">site jobs</span>
					</>
				)}
			</span>
		</GlassTag>
	);
}

const PROMISES = [
	{
		icon: <LuLockKeyhole />,
		tone: 'accent',
		title: 'Escrow-protected jobs',
		text: 'Payment is released stage by stage, only when you confirm the work.',
	},
	{
		icon: <LuBadgeCheck />,
		tone: 'success',
		title: 'One verified identity',
		text: 'Verify each business profile once — one plan lists them all.',
	},
];

function Hero() {
	return (
		<section className="relative overflow-hidden">
			<HeroGlow />
			<div className="relative mx-auto grid w-full max-w-360 gap-5 px-4 pt-6 pb-10 md:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:pt-10 xl:px-12">
				<Card className="flex flex-col p-6 sm:p-10 xl:p-12">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<Chip $accent>One account · Four pillars</Chip>
						<span className="font-label text-xs font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
							Construction & engineering
						</span>
					</div>

					<HeroTitle className="mt-8">
						Build, bid
						<br />& hire on
						<span className="sc_accent">one grid.</span>
					</HeroTitle>

					<p className="mt-6 max-w-xl text-[17px] leading-relaxed text-(--pg-text-secondary)">
						Hire verified engineering consultants, bid on sealed tenders, buy
						drafting files and building materials, and find skilled hands near
						the site — all from a single PolyGrid account.
					</p>

					<div className="mt-9 flex flex-col gap-3 sm:flex-row">
						<AppButton to={ROUTES.REGISTER} icon={<LuArrowUpRight />}>
							Join PolyGrid
						</AppButton>
						<AppButton
							href="#pillars"
							variant="secondary"
							icon={<LuArrowDown />}
						>
							The four pillars
						</AppButton>
					</div>

					<div className="mt-auto pt-10">
						<div className="flex flex-col gap-3 rounded-xl border border-(--pg-card-border) bg-(--pg-surface-sunken) px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
							<span className="font-label flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase">
								<LuShieldCheck className="text-base text-(--pg-text-highlight)" />
								Verified business profiles only
							</span>
							<span className="font-label flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-status-success) uppercase">
								<LiveDot />
								Live marketplace
							</span>
						</div>
					</div>
				</Card>

				<ImagePanel $hero className="min-h-105 lg:min-h-160">
					<img
						src={heroImage}
						alt="A large bridge under construction at dusk, cranes along the deck"
						fetchPriority="high"
					/>
					<div className="sc_layer flex flex-col justify-between gap-6 p-5 sm:p-6">
						<div>
							<LiveCounts />
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{PROMISES.map(({ icon, tone, title, text }) => (
								<GlassNote key={title}>
									<IconBox $size={38} $tone={tone}>
										{icon}
									</IconBox>
									<span className="flex flex-col gap-1">
										<span className="sc_title">{title}</span>
										<span className="sc_text">{text}</span>
									</span>
								</GlassNote>
							))}
						</div>
					</div>
				</ImagePanel>
			</div>
		</section>
	);
}

export default Hero;
