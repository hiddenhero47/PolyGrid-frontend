import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
	LuSearch,
	LuGavel,
	LuClipboardList,
	LuArrowRight,
	LuLock,
	LuMapPinned,
	LuHardHat,
} from 'react-icons/lu';
import StatsServices from '../../features/services/custom-hooks/stats';
import { selectIsAuthenticated } from '../../store/slice/auth';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { Eyebrow } from '../home/elements/index.style';
import { PageBand } from '../engineering/elements/index.style';
import { ROUTES } from '../../utilities/app-routes';
import { specialtyLabel, skillLabel } from '../../utilities/basic-functions';
import { TenderTile, CountTile } from './elements/index.style';

// The two gated boards' public pages (frontend-plan §A.18 Tenders, §A.19
// SiteForce): counts only — open total and per category — never a
// listing, plus the three ways in. `useSummary` is the public-summary
// hook; every board's categories reuse a profile enum's labels.
const BOARDS = {
	tenders: {
		useSummary: StatsServices.getTenderSummary,
		categoryLabel: specialtyLabel,
		pillar: 'PolyGrid Tenders',
		title: 'Build it through tenders',
		subtitle:
			'A sealed bidding board for construction projects: posters see every bid, contractors see only their own. Or skip the tender and hire a verified contractor directly.',
		unit: ['open project', 'open projects'],
		lockNote: 'Project details open to verified, subscribed contractors.',
		emptyNote:
			'No open projects right now — new tenders appear here as they’re posted.',
		paths: (into, signedIn) => [
			{
				icon: LuSearch,
				title: 'Find a contractor',
				text: 'Browse verified builders and trade firms and hire one directly.',
				to: ROUTES.CONTRACTORS,
				cta: 'Browse contractors',
				primary: true,
			},
			{
				icon: LuClipboardList,
				title: 'Post a project',
				text: 'Describe the job once; verified contractors send sealed bids you compare side by side.',
				to: into(ROUTES.DASHBOARD_CLIENT),
				cta: signedIn ? 'Set up a client profile' : 'Join to post',
			},
			{
				icon: LuGavel,
				title: 'Bid as a contractor',
				text: 'Get verified, pick a plan, and the open board is yours to bid on.',
				to: into(ROUTES.DASHBOARD_CONTRACTOR),
				cta: signedIn ? 'Set up a contractor profile' : 'Join to bid',
			},
		],
	},
	siteforce: {
		useSummary: StatsServices.getJobOpeningSummary,
		categoryLabel: skillLabel,
		pillar: 'PolyGrid SiteForce',
		title: 'Site work, near you',
		subtitle:
			'A location-based job board for tradespeople: posters share the rough area and pay, and only workers they accept see the exact site. Or book a verified worker directly.',
		unit: ['open job', 'open jobs'],
		lockNote: 'Job details open to verified, subscribed workers.',
		emptyNote:
			'No open site jobs right now — new ones appear here as they’re posted.',
		paths: (into, signedIn) => [
			{
				icon: LuSearch,
				title: 'Find a worker',
				text: 'Browse verified carpenters, electricians, plumbers, masons and crews, and book one directly.',
				to: ROUTES.WORKERS,
				cta: 'Browse tradespeople',
				primary: true,
			},
			{
				icon: LuMapPinned,
				title: 'Post a site job',
				text: 'Share the area, the trade and the pay; workers nearby apply and you choose.',
				to: into(ROUTES.DASHBOARD_CLIENT),
				cta: signedIn ? 'Set up a client profile' : 'Join to post',
			},
			{
				icon: LuHardHat,
				title: 'Find work',
				text: 'Get verified, pick a plan, and apply to jobs near you.',
				to: into(ROUTES.DASHBOARD_LABOR),
				cta: signedIn ? 'Set up a worker profile' : 'Join to apply',
			},
		],
	},
};

function BoardTeaser({ board }) {
	const config = BOARDS[board];
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const { data, isPending, isError } = config.useSummary();
	const categories = [...(data?.byCategory || [])].sort(
		(a, b) => b.count - a.count
	);
	const total = data?.totalOpen ?? 0;

	// signed-out visitors join first; register lands them on the dashboard
	const into = (to) => (isAuthenticated ? to : ROUTES.REGISTER);

	return (
		<>
			<PageBand>
				<div className="relative mx-auto w-full max-w-[1440px] px-4 py-12 md:px-8 lg:py-16 xl:px-12">
					<Eyebrow>{config.pillar}</Eyebrow>
					<h1 className="sc_title mt-3">{config.title}</h1>
					<p className="sc_subtitle">{config.subtitle}</p>
				</div>
			</PageBand>

			<div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 py-10 md:px-8 xl:px-12">
				<section aria-label="Ways in" className="grid gap-5 md:grid-cols-3">
					{config
						.paths(into, isAuthenticated)
						.map(({ icon: Icon, ...path }) => (
							<TenderTile key={path.title}>
								<span className="sc_tileIcon" aria-hidden="true">
									<Icon />
								</span>
								<h2 className="sc_tileTitle">{path.title}</h2>
								<p className="sc_tileText">{path.text}</p>
								<AppButton
									to={path.to}
									variant={path.primary ? 'primary' : 'secondary'}
									icon={<LuArrowRight />}
								>
									{path.cta}
								</AppButton>
							</TenderTile>
						))}
				</section>

				<section aria-labelledby="board-heading">
					<div className="mb-5 flex flex-wrap items-end justify-between gap-4">
						<div>
							<Eyebrow>Live board</Eyebrow>
							<h2
								id="board-heading"
								className="font-display mt-2 text-3xl font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase"
							>
								{isPending ? (
									<SkeletonBar $width="220px" style={{ height: 32 }} />
								) : isError ? (
									config.unit[1]
								) : (
									`${total.toLocaleString()} ${config.unit[total === 1 ? 0 : 1]}`
								)}
							</h2>
						</div>
						<p className="inline-flex items-center gap-2 text-sm text-(--pg-text-secondary)">
							<LuLock aria-hidden="true" /> {config.lockNote}
						</p>
					</div>

					{!isPending && !isError && categories.length === 0 && (
						<p className="text-[15px] text-(--pg-text-secondary)">
							{config.emptyNote}
						</p>
					)}
					{categories.length > 0 && (
						<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							{categories.map(({ category, count }) => (
								<CountTile key={category}>
									<span className="sc_count">{count}</span>
									<span className="sc_label">
										{config.categoryLabel(category)}
									</span>
								</CountTile>
							))}
						</ul>
					)}
				</section>
			</div>
		</>
	);
}

BoardTeaser.propTypes = {
	board: PropTypes.oneOf(Object.keys(BOARDS)).isRequired,
};

export default BoardTeaser;
