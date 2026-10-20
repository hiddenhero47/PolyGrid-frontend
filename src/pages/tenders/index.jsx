import React from 'react';
import { useSelector } from 'react-redux';
import {
	LuSearch,
	LuGavel,
	LuClipboardList,
	LuArrowRight,
	LuLock,
} from 'react-icons/lu';
import StatsServices from '../../features/services/custom-hooks/stats';
import { selectIsAuthenticated } from '../../store/slice/auth';
import { AppButton } from '../../components/button';
import { SkeletonBar } from '../../components/table/index.style';
import { Eyebrow } from '../home/elements/index.style';
import { PageBand } from '../engineering/elements/index.style';
import { ROUTES } from '../../utilities/app-routes';
import { specialtyLabel } from '../../utilities/basic-functions';
import { TenderTile, CountTile } from './elements/index.style';

// frontend-plan §A.18 — PolyGrid Tenders, public side. The bidding board
// itself is gated (an eligible, subscribed contractor only), so visitors
// get counts — total open projects and per category — never a project
// (GET /api/tender-projects/public-summary). Plus the three ways in:
// find a contractor, bid as one, or post a project.
function Tenders() {
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const { data, isPending, isError } = StatsServices.getTenderSummary();
	const categories = [...(data?.byCategory || [])].sort(
		(a, b) => b.count - a.count
	);

	// signed-out visitors go through sign-in; the dashboard routes bring
	// them back where they were going
	const into = (to) => (isAuthenticated ? to : ROUTES.REGISTER);

	const paths = [
		{
			icon: LuSearch,
			title: 'Find a contractor',
			text: 'Browse verified builders and trade firms and hire one directly.',
			to: ROUTES.CONTRACTORS,
			cta: 'Browse contractors',
		},
		{
			icon: LuClipboardList,
			title: 'Post a project',
			text: 'Describe the job once; verified contractors send sealed bids you compare side by side.',
			to: into(ROUTES.DASHBOARD_CLIENT),
			cta: isAuthenticated ? 'Set up a client profile' : 'Join to post',
		},
		{
			icon: LuGavel,
			title: 'Bid as a contractor',
			text: 'Get verified, pick a plan, and the open board is yours to bid on.',
			to: into(ROUTES.DASHBOARD_CONTRACTOR),
			cta: isAuthenticated ? 'Set up a contractor profile' : 'Join to bid',
		},
	];

	return (
		<>
			<PageBand>
				<div className="relative mx-auto w-full max-w-[1440px] px-4 py-12 md:px-8 lg:py-16 xl:px-12">
					<Eyebrow>PolyGrid Tenders</Eyebrow>
					<h1 className="sc_title mt-3">Build it through tenders</h1>
					<p className="sc_subtitle">
						A sealed bidding board for construction projects: posters see every
						bid, contractors see only their own. Or skip the tender and hire a
						verified contractor directly.
					</p>
				</div>
			</PageBand>

			<div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 py-10 md:px-8 xl:px-12">
				<section aria-label="Ways in" className="grid gap-5 md:grid-cols-3">
					{paths.map(({ icon: Icon, ...path }) => (
						<TenderTile key={path.title}>
							<span className="sc_tileIcon" aria-hidden="true">
								<Icon />
							</span>
							<h2 className="sc_tileTitle">{path.title}</h2>
							<p className="sc_tileText">{path.text}</p>
							<AppButton
								to={path.to}
								variant={
									path.to === ROUTES.CONTRACTORS ? 'primary' : 'secondary'
								}
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
									'Open projects'
								) : (
									`${(data?.totalOpen ?? 0).toLocaleString()} open project${data?.totalOpen === 1 ? '' : 's'}`
								)}
							</h2>
						</div>
						<p className="inline-flex items-center gap-2 text-sm text-(--pg-text-secondary)">
							<LuLock aria-hidden="true" /> Project details open to verified,
							subscribed contractors.
						</p>
					</div>

					{!isPending && !isError && categories.length === 0 && (
						<p className="text-[15px] text-(--pg-text-secondary)">
							No open projects right now — new tenders appear here as they’re
							posted.
						</p>
					)}
					{categories.length > 0 && (
						<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							{categories.map(({ category, count }) => (
								<CountTile key={category}>
									<span className="sc_count">{count}</span>
									<span className="sc_label">{specialtyLabel(category)}</span>
								</CountTile>
							))}
						</ul>
					)}
				</section>
			</div>
		</>
	);
}

export default Tenders;
