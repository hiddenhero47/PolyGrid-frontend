import React, { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuArrowRight,
	LuCloudOff,
	LuFileText,
	LuGavel,
	LuHandshake,
	LuPaperclip,
	LuPencil,
	LuRotateCw,
	LuSend,
	LuUsers,
	LuX,
} from 'react-icons/lu';
import TenderServices from '../../../features/services/custom-hooks/tenders';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../../layouts/toast/toast-handler';
import AppLoader from '../../../components/loader';
import EmptyState from '../../../components/empty-state';
import UnavailableState from '../../../components/empty-state/unavailable-state';
import StatusBadge from '../../../components/status-badge';
import RatingStars from '../../../components/rating-stars';
import ConfirmModal from '../../../components/modal/confirm-modal';
import { AppButton } from '../../../components/button';
import { CustomFile } from '../../../components/form-components';
import { Chip } from '../../home/elements/index.style';
import {
	BID_STATUS_BADGES,
	MAX_PROJECT_FILES,
	PROJECT_FILE_ACCEPT,
	PROJECT_FILE_ACCEPT_LABEL,
	TENDER_STATUS_BADGES,
} from '../../../utilities/app-const';
import {
	formatDate,
	formatMoney,
	specialtyLabel,
} from '../../../utilities/basic-functions';
import { ROUTES, contractorPath } from '../../../utilities/app-routes';
import { BackLink, Fact, FileList, Panel } from '../elements/panels';
import {
	budgetText,
	idOf,
	isPast,
	placeText,
} from '../elements/listing-helpers';
import BidModal from './elements/bid-modal';
import EditProjectModal from './elements/edit-project-modal';

const jobPath = (id) => `${ROUTES.DASHBOARD_JOBS}/${id}`;

// The poster's view of every bid — sealed from everyone else.
function BidsPanel({ project, onAward, awarding }) {
	const bids = TenderServices.bids(project.id);
	const rows = bids.data || [];
	const open = project.status === 'open';

	return (
		<Panel
			title={`Bids (${rows.length})`}
			icon={<LuGavel aria-hidden="true" />}
		>
			{bids.isPending ? (
				<AppLoader />
			) : bids.isError ? (
				<AppButton
					variant="secondary"
					icon={<LuRotateCw />}
					onClick={() => bids.refetch()}
				>
					Retry
				</AppButton>
			) : rows.length === 0 ? (
				<p className="text-sm text-(--pg-text-secondary)">
					No bids yet. Verified contractors in this category can see your
					project and bid until {formatDate(project.bidDeadline)}.
				</p>
			) : (
				<ul className="flex flex-col gap-3">
					{rows.map((bid) => {
						const contractor =
							typeof bid.contractorId === 'object' ? bid.contractorId : null;
						const bidder = typeof bid.bidder === 'object' ? bid.bidder : null;
						return (
							<li
								key={bid.id}
								className="rounded-xl border border-(--pg-card-border) p-4"
							>
								<div className="flex flex-wrap items-start gap-3">
									<div className="min-w-0 flex-1">
										{contractor ? (
											<Link
												to={contractorPath({
													slug: contractor.slug,
													id: idOf(contractor),
												})}
												target="_blank"
												className="text-[15px] font-semibold text-(--pg-text-primary) hover:underline"
											>
												{contractor.headline || 'Contractor'}
											</Link>
										) : (
											<span className="text-[15px] font-semibold text-(--pg-text-primary)">
												Contractor
											</span>
										)}
										<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-(--pg-text-secondary)">
											{bidder?.fullName && <span>{bidder.fullName}</span>}
											{contractor?.ratingCount > 0 && (
												<RatingStars
													value={contractor.ratingAverage}
													count={contractor.ratingCount}
													size={13}
												/>
											)}
											<span>Bid {formatDate(bid.createdAt)}</span>
										</div>
									</div>
									<div className="text-right">
										<p className="font-display text-xl font-semibold text-(--pg-text-primary)">
											{formatMoney(bid.amount, bid.currency)}
										</p>
										{bid.estimatedDurationDays && (
											<p className="text-xs text-(--pg-text-secondary)">
												{bid.estimatedDurationDays} days
											</p>
										)}
									</div>
									<StatusBadge status={bid.status} map={BID_STATUS_BADGES} />
								</div>
								<p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-(--pg-text-primary)">
									{bid.proposal}
								</p>
								{open && bid.status === 'pending' && (
									<div className="mt-3">
										<AppButton
											onClick={() => onAward(bid, contractor)}
											disabled={awarding}
										>
											Award this bid
										</AppButton>
									</div>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</Panel>
	);
}

// frontend-plan §B.9 — one tender project. The poster manages it and
// sees every bid; a contractor sees the project, the running bid count
// and only their own bid.
function TenderProjectDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useSelector((state) => state.auth);
	const {
		data: project,
		isPending,
		isError,
		error,
		refetch,
	} = TenderServices.get(id);
	const isPoster =
		Boolean(project?.postedBy) && idOf(project.postedBy) === String(user?.id);
	// the backend includes your own bid (any status) for a contractor
	const myBid = project?.myBid || null;

	const update = TenderServices.update();
	const addFiles = TenderServices.addFiles();
	const removeFile = TenderServices.removeFile();
	const cancel = TenderServices.cancel();
	const award = TenderServices.award();
	const submitBid = TenderServices.submitBid();
	const updateBid = TenderServices.updateBid();
	const withdrawBid = TenderServices.withdrawBid();

	const confirmRef = useRef(null);
	const bidRef = useRef(null);
	const editRef = useRef(null);
	const [newFiles, setNewFiles] = useState([]);

	const back = isPoster ? (
		<BackLink to={`${ROUTES.DASHBOARD_TENDERS}?view=projects`}>
			My projects
		</BackLink>
	) : (
		<BackLink to={ROUTES.DASHBOARD_TENDERS}>Tender board</BackLink>
	);

	if (isPending) return <AppLoader showLabel />;
	if (isError || !project) {
		const status = error?.response?.status;
		return (
			<>
				{back}
				{status === 404 ? (
					<EmptyState
						icon={<LuGavel />}
						title="Project not found"
						actions={
							<AppButton to={ROUTES.DASHBOARD_TENDERS}>
								Back to Tenders
							</AppButton>
						}
					/>
				) : (
					<EmptyState
						tone="error"
						icon={<LuCloudOff />}
						title="Couldn’t load this project"
						actions={
							<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
								Retry
							</AppButton>
						}
					/>
				)}
			</>
		);
	}
	if (project.available === false)
		return (
			<>
				{back}
				<UnavailableState
					message={project.message}
					browseTo={ROUTES.DASHBOARD_TENDERS}
					browseLabel="Back to Tenders"
				/>
			</>
		);

	const open = project.status === 'open';
	const biddingOpen = open && !isPast(project.bidDeadline);
	const files = project.files || [];

	const onCancel = async () => {
		const ok = await confirmRef.current.ask({
			title: 'Cancel this project?',
			text: `It leaves the board and every pending bid (${project.bidCount || 0}) is turned down. This can’t be undone.`,
			confirmLabel: 'Cancel project',
		});
		if (ok)
			cancel.mutate(project.id, {
				onSuccess: () => toast.success('Project cancelled'),
			});
	};

	const onAward = async (bid, contractor) => {
		const ok = await confirmRef.current.ask({
			title: `Award to ${contractor?.headline || 'this contractor'}?`,
			text: `${formatMoney(bid.amount, bid.currency)}. Every other pending bid is turned down, and a job is created for them to confirm — you’ll fund it from there.`,
			confirmLabel: 'Award',
		});
		if (ok)
			award.mutate(
				{ id: project.id, bidId: bid.id },
				{
					onSuccess: (res) =>
						toast.success('Awarded — the job is waiting for them to confirm', {
							actionText: 'Open job',
							onAction: () => res?.job?._id && navigate(jobPath(res.job._id)),
						}),
				}
			);
	};

	const onWithdraw = async () => {
		const ok = await confirmRef.current.ask({
			title: 'Withdraw your bid?',
			text: biddingOpen
				? 'You can’t bid on this project again afterwards.'
				: 'Bids are closed, so you can’t bid again.',
			confirmLabel: 'Withdraw',
		});
		if (ok)
			withdrawBid.mutate(project.id, {
				onSuccess: () => toast.success('Bid withdrawn'),
			});
	};

	const onRemoveFile = async (file) => {
		const ok = await confirmRef.current.ask({
			title: 'Remove this file?',
			text: file.fileName,
			confirmLabel: 'Remove',
		});
		if (ok) removeFile.mutate({ id: project.id, fileName: file.fileName });
	};

	const bidBusy = submitBid.isPending || updateBid.isPending;
	const sendBid = (values) => {
		const mutation = myBid?.status === 'pending' ? updateBid : submitBid;
		mutation.mutate(
			{ id: project.id, ...values },
			{
				onSuccess: () => {
					bidRef.current.close();
					toast.success(
						myBid
							? 'Bid updated'
							: 'Bid sent — it stays sealed from other contractors'
					);
				},
			}
		);
	};

	return (
		<>
			{back}
			<PageHeader
				eyebrow={specialtyLabel(project.category)}
				title={project.title}
				subtitle={[
					placeText(project.location),
					`Posted ${formatDate(project.createdAt)}`,
				].join(' · ')}
				actions={
					isPoster &&
					open && (
						<>
							<AppButton
								variant="secondary"
								icon={<LuPencil />}
								onClick={() => editRef.current.open()}
							>
								Edit
							</AppButton>
							<AppButton
								variant="secondary"
								icon={<LuX />}
								onClick={onCancel}
								disabled={cancel.isPending}
							>
								Cancel project
							</AppButton>
						</>
					)
				}
			/>

			<div className="mb-6 flex flex-wrap items-center gap-3">
				<StatusBadge status={project.status} map={TENDER_STATUS_BADGES} />
				{project.job && (isPoster || myBid?.status === 'accepted') && (
					<AppButton to={jobPath(idOf(project.job))} icon={<LuHandshake />}>
						Open the job
					</AppButton>
				)}
			</div>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div className="flex min-w-0 flex-col gap-5">
					<Panel title="The project" icon={<LuFileText aria-hidden="true" />}>
						<p className="text-[15px] leading-relaxed whitespace-pre-line text-(--pg-text-primary)">
							{project.description}
						</p>
					</Panel>

					<Panel
						title={`Files (${files.length}/${MAX_PROJECT_FILES})`}
						icon={<LuPaperclip aria-hidden="true" />}
					>
						<FileList
							files={files}
							onRemove={isPoster && open ? onRemoveFile : undefined}
							removing={removeFile.isPending}
						/>
						{isPoster && open && files.length < MAX_PROJECT_FILES && (
							<div className="mt-4 flex flex-col gap-3">
								<CustomFile
									label="Add files"
									multiple
									compact
									maxFiles={MAX_PROJECT_FILES - files.length}
									accept={PROJECT_FILE_ACCEPT}
									acceptLabel={PROJECT_FILE_ACCEPT_LABEL}
									value={newFiles}
									onChange={setNewFiles}
								/>
								{newFiles.length > 0 && (
									<div>
										<AppButton
											onClick={() =>
												addFiles.mutate(
													{ id: project.id, files: newFiles },
													{
														onSuccess: (res) => {
															setNewFiles([]);
															if (res.fileWarnings?.length)
																toast.warning(res.fileWarnings.join(' · '));
															else toast.success('Files added');
														},
													}
												)
											}
											disabled={addFiles.isPending}
										>
											{addFiles.isPending
												? 'Uploading…'
												: `Upload ${newFiles.length} file${newFiles.length > 1 ? 's' : ''}`}
										</AppButton>
									</div>
								)}
							</div>
						)}
					</Panel>

					{isPoster && (
						<BidsPanel
							project={project}
							onAward={onAward}
							awarding={award.isPending}
						/>
					)}
				</div>

				<aside className="flex flex-col gap-5">
					<Panel title="At a glance">
						<dl className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<Fact label="Budget">{budgetText(project)}</Fact>
							</div>
							<Fact label="Bids so far">{project.bidCount || 0}</Fact>
							<Fact
								label={
									isPast(project.bidDeadline) ? 'Bids closed' : 'Bids close'
								}
							>
								{formatDate(project.bidDeadline)}
							</Fact>
							<div className="col-span-2">
								<Fact label="Site">{placeText(project.location)}</Fact>
							</div>
						</dl>
					</Panel>

					{!isPoster && (
						<Panel title="Your bid" icon={<LuSend aria-hidden="true" />}>
							{myBid ? (
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3">
										<span className="font-display text-2xl font-semibold text-(--pg-text-primary)">
											{formatMoney(myBid.amount, myBid.currency)}
										</span>
										<StatusBadge
											status={myBid.status}
											map={BID_STATUS_BADGES}
										/>
									</div>
									{myBid.estimatedDurationDays && (
										<p className="text-sm text-(--pg-text-secondary)">
											{myBid.estimatedDurationDays} days
										</p>
									)}
									<p className="line-clamp-6 text-sm whitespace-pre-line text-(--pg-text-primary)">
										{myBid.proposal}
									</p>
									{myBid.status === 'pending' && biddingOpen && (
										<div className="flex flex-wrap gap-2">
											<AppButton
												variant="secondary"
												icon={<LuPencil />}
												onClick={() => bidRef.current.open()}
											>
												Revise
											</AppButton>
											<AppButton
												variant="secondary"
												onClick={onWithdraw}
												disabled={withdrawBid.isPending}
											>
												Withdraw
											</AppButton>
										</div>
									)}
									{myBid.status === 'accepted' && (
										<p className="text-sm text-(--pg-status-success)">
											You won this one — confirm the job to get started.
										</p>
									)}
								</div>
							) : biddingOpen ? (
								<div className="flex flex-col gap-3">
									<p className="text-sm text-(--pg-text-secondary)">
										Bids are sealed — the poster sees yours, other contractors
										never do.
									</p>
									<AppButton
										icon={<LuArrowRight />}
										onClick={() => bidRef.current.open()}
									>
										Place a bid
									</AppButton>
								</div>
							) : (
								<p className="text-sm text-(--pg-text-secondary)">
									This project isn’t taking bids any more.
								</p>
							)}
						</Panel>
					)}

					{isPoster && (
						<Panel
							title="How awarding works"
							icon={<LuUsers aria-hidden="true" />}
						>
							<p className="text-sm text-(--pg-text-secondary)">
								Awarding a bid turns every other pending bid down and creates a
								job at the bid’s price. The contractor confirms it, you fund it
								into escrow, and money is released stage by stage.
							</p>
						</Panel>
					)}
				</aside>
			</div>

			<ConfirmModal refName={confirmRef} />
			{!isPoster && (
				<BidModal
					refName={bidRef}
					bid={myBid?.status === 'pending' ? myBid : null}
					projectTitle={project.title}
					onSubmit={sendBid}
					isPending={bidBusy}
				/>
			)}
			{isPoster && (
				<EditProjectModal
					refName={editRef}
					project={project}
					isPending={update.isPending}
					onSubmit={(values) =>
						update.mutate(
							{ id: project.id, ...values },
							{
								onSuccess: () => {
									editRef.current.close();
									toast.success('Project updated');
								},
							}
						)
					}
				/>
			)}
		</>
	);
}

export default TenderProjectDetail;
