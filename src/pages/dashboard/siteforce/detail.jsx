import React, { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
	LuArrowRight,
	LuCamera,
	LuCloudOff,
	LuExternalLink,
	LuFileText,
	LuHandshake,
	LuHardHat,
	LuLock,
	LuLockOpen,
	LuMapPin,
	LuPencil,
	LuPhone,
	LuRotateCw,
	LuSend,
	LuUsers,
	LuX,
} from 'react-icons/lu';
import SiteForceServices from '../../../features/services/custom-hooks/siteforce';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../../layouts/toast/toast-handler';
import AppLoader from '../../../components/loader';
import EmptyState from '../../../components/empty-state';
import UnavailableState from '../../../components/empty-state/unavailable-state';
import StatusBadge from '../../../components/status-badge';
import RatingStars from '../../../components/rating-stars';
import ConfirmModal from '../../../components/modal/confirm-modal';
import LocationMap from '../../../components/location-picker/location-map';
import { AppButton } from '../../../components/button';
import { CustomFile } from '../../../components/form-components';
import {
	APPLICATION_STATUS_BADGES,
	EMPLOYMENT_TYPE_LABELS,
	MAX_OPENING_FILES,
	OPENING_STATUS_BADGES,
	PORTFOLIO_ACCEPT,
} from '../../../utilities/app-const';
import { formatDate, skillLabel } from '../../../utilities/basic-functions';
import { ROUTES, workerPath } from '../../../utilities/app-routes';
import { BackLink, Fact, FileList, Panel } from '../elements/panels';
import { idOf, isPast, payText, placeText } from '../elements/listing-helpers';
import ReasonModal from '../jobs/elements/reason-modal';
import EditOpeningModal from './elements/edit-opening-modal';

const jobPath = (id) => `${ROUTES.DASHBOARD_JOBS}/${id}`;

// The poster's view of every application — sealed from other applicants.
function ApplicationsPanel({ opening, onAccept, onReject, busy }) {
	const apps = SiteForceServices.applications(opening.id);
	const rows = apps.data || [];
	const open = opening.status === 'open';

	return (
		<Panel
			title={`Applications (${rows.length})`}
			icon={<LuUsers aria-hidden="true" />}
		>
			{apps.isPending ? (
				<AppLoader />
			) : apps.isError ? (
				<AppButton
					variant="secondary"
					icon={<LuRotateCw />}
					onClick={() => apps.refetch()}
				>
					Retry
				</AppButton>
			) : rows.length === 0 ? (
				<p className="text-sm text-(--pg-text-secondary)">
					No applications yet. Verified{' '}
					{skillLabel(opening.category).toLowerCase()} workers can see this job
					and apply.
				</p>
			) : (
				<ul className="flex flex-col gap-3">
					{rows.map((app) => {
						const worker =
							typeof app.workerId === 'object' ? app.workerId : null;
						const applicant =
							typeof app.applicant === 'object' ? app.applicant : null;
						return (
							<li
								key={app.id}
								className="rounded-xl border border-(--pg-card-border) p-4"
							>
								<div className="flex flex-wrap items-start gap-3">
									<div className="min-w-0 flex-1">
										{worker ? (
											<Link
												to={workerPath({ slug: worker.slug, id: idOf(worker) })}
												target="_blank"
												className="text-[15px] font-semibold text-(--pg-text-primary) hover:underline"
											>
												{worker.headline || applicant?.fullName || 'Worker'}
											</Link>
										) : (
											<span className="text-[15px] font-semibold text-(--pg-text-primary)">
												{applicant?.fullName || 'Worker'}
											</span>
										)}
										<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-(--pg-text-secondary)">
											{applicant?.fullName && worker?.headline && (
												<span>{applicant.fullName}</span>
											)}
											{worker?.ratingCount > 0 && (
												<RatingStars
													value={worker.ratingAverage}
													count={worker.ratingCount}
													size={13}
												/>
											)}
											<span>Applied {formatDate(app.createdAt)}</span>
										</div>
									</div>
									<StatusBadge
										status={app.status}
										map={APPLICATION_STATUS_BADGES}
									/>
								</div>
								{app.message && (
									<p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-(--pg-text-primary)">
										{app.message}
									</p>
								)}
								{open && app.status === 'pending' && (
									<div className="mt-3 flex flex-wrap gap-2">
										<AppButton
											onClick={() => onAccept(app, worker, applicant)}
											disabled={busy}
										>
											Accept
										</AppButton>
										<AppButton
											variant="secondary"
											onClick={() => onReject(app)}
											disabled={busy}
										>
											Turn down
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

// The exact tier: location, address, contact, photos — or the locked
// panel saying what unlocks it.
function ExactTier({ opening, unlocked, isPoster, files, children }) {
	if (!unlocked)
		return (
			<Panel
				title="Exact location & contact"
				icon={<LuLock aria-hidden="true" />}
			>
				<div className="flex items-start gap-3 rounded-xl border border-dashed border-(--pg-card-borderHover) p-4">
					<LuLock
						aria-hidden="true"
						className="mt-0.5 shrink-0 text-(--pg-text-secondary)"
					/>
					<p className="text-sm text-(--pg-text-secondary)">
						The exact site, address, contact person and photos unlock once the
						poster accepts you. Until then you see the general area:{' '}
						<strong className="text-(--pg-text-primary)">
							{placeText(opening.generalArea)}
						</strong>
						.
					</p>
				</div>
			</Panel>
		);

	const { coordinates: c, address, googleMapsUrl, contactInfo } = opening;
	const nothing = !c?.lat && !address && !googleMapsUrl && !contactInfo;
	return (
		<Panel
			title={
				isPoster
					? 'Exact location & contact — only accepted workers see this'
					: 'Exact location & contact'
			}
			icon={<LuLockOpen aria-hidden="true" />}
		>
			{nothing ? (
				<p className="text-sm text-(--pg-text-secondary)">
					{isPoster
						? 'You haven’t added the exact site yet — edit the job to pin it, so accepted workers can find it.'
						: 'The poster hasn’t added the exact site yet — ask them on the job.'}
				</p>
			) : (
				<div className="flex flex-col gap-4">
					{c?.lat != null && <LocationMap lat={c.lat} lng={c.lng} />}
					<dl className="grid gap-4 sm:grid-cols-2">
						{address && (
							<Fact label="Address">
								<span className="inline-flex items-start gap-1.5">
									<LuMapPin aria-hidden="true" className="mt-0.5 shrink-0" />{' '}
									{address}
								</span>
							</Fact>
						)}
						{contactInfo && (
							<Fact label="Site contact">
								<span className="inline-flex items-start gap-1.5">
									<LuPhone aria-hidden="true" className="mt-0.5 shrink-0" />{' '}
									{contactInfo}
								</span>
							</Fact>
						)}
					</dl>
					<div className="flex flex-wrap gap-2">
						{c?.lat != null && (
							<AppButton
								variant="secondary"
								icon={<LuExternalLink />}
								onClick={() =>
									window.open(
										`https://www.google.com/maps?q=${c.lat},${c.lng}`,
										'_blank',
										'noopener'
									)
								}
							>
								Directions
							</AppButton>
						)}
						{googleMapsUrl && (
							<AppButton
								variant="secondary"
								icon={<LuExternalLink />}
								onClick={() => window.open(googleMapsUrl, '_blank', 'noopener')}
							>
								Poster’s map link
							</AppButton>
						)}
					</div>
				</div>
			)}
			<div className="mt-5">
				<p className="font-label mb-2 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase">
					<LuCamera aria-hidden="true" /> Site photos ({files.length}/
					{MAX_OPENING_FILES})
				</p>
				{children}
			</div>
		</Panel>
	);
}

// frontend-plan §B.12 — one SiteForce job opening, in two tiers: the
// general picture any eligible worker sees, and the exact site that only
// the poster, admins and accepted workers get.
function JobOpeningDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useSelector((state) => state.auth);
	const {
		data: opening,
		isPending,
		isError,
		error,
		refetch,
	} = SiteForceServices.get(id);
	const isPoster =
		Boolean(opening?.postedBy) && idOf(opening.postedBy) === String(user?.id);
	const myApps = SiteForceServices.myApplications(
		{ page: 1, limit: 100 },
		{ enabled: Boolean(opening?.id) && !isPoster }
	);
	const myApp = (myApps.data?.data || []).find((a) => idOf(a.posting) === id);

	const update = SiteForceServices.update();
	const addFiles = SiteForceServices.addFiles();
	const removeFile = SiteForceServices.removeFile();
	const cancel = SiteForceServices.cancel();
	const apply = SiteForceServices.apply();
	const updateApp = SiteForceServices.updateApplication();
	const withdraw = SiteForceServices.withdrawApplication();
	const accept = SiteForceServices.accept();
	const reject = SiteForceServices.reject();

	const confirmRef = useRef(null);
	const messageRef = useRef(null);
	const editRef = useRef(null);
	const [newFiles, setNewFiles] = useState([]);

	const back = isPoster ? (
		<BackLink to={`${ROUTES.DASHBOARD_SITEFORCE}?view=postings`}>
			My postings
		</BackLink>
	) : (
		<BackLink to={ROUTES.DASHBOARD_SITEFORCE}>Job board</BackLink>
	);

	if (isPending) return <AppLoader showLabel />;
	if (isError || !opening) {
		const status = error?.response?.status;
		return (
			<>
				{back}
				{status === 404 ? (
					<EmptyState
						icon={<LuHardHat />}
						title="Job not found"
						actions={
							<AppButton to={ROUTES.DASHBOARD_SITEFORCE}>
								Back to SiteForce
							</AppButton>
						}
					/>
				) : (
					<EmptyState
						tone="error"
						icon={<LuCloudOff />}
						title="Couldn’t load this job"
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
	if (opening.available === false)
		return (
			<>
				{back}
				<UnavailableState
					message={opening.message}
					browseTo={ROUTES.DASHBOARD_SITEFORCE}
					browseLabel="Back to SiteForce"
				/>
			</>
		);

	const open = opening.status === 'open';
	const applying = open && !isPast(opening.applicationDeadline);
	// the backend only sends `files` (and the rest of the exact tier) to
	// those allowed to see it
	const unlocked = Array.isArray(opening.files);
	const files = opening.files || [];
	const accepted = myApp?.status === 'accepted';

	const onCancel = async () => {
		const ok = await confirmRef.current.ask({
			title: 'Cancel this job?',
			text: 'It leaves the board and pending applications are turned down. People you’ve already accepted keep their jobs.',
			confirmLabel: 'Cancel job',
		});
		if (ok)
			cancel.mutate(opening.id, {
				onSuccess: () => toast.success('Job cancelled'),
			});
	};

	const onAccept = async (app, worker, applicant) => {
		const left = opening.workersNeeded - (opening.filledCount || 0);
		const ok = await confirmRef.current.ask({
			title: `Accept ${worker?.headline || applicant?.fullName || 'this worker'}?`,
			text: `A job is created at ${payText(opening)} for them to confirm, and they get the exact location.${left <= 1 ? ' That fills the last place — other pending applications are turned down.' : ` ${left - 1} more place${left - 1 === 1 ? '' : 's'} left after this.`}`,
			confirmLabel: 'Accept',
		});
		if (ok)
			accept.mutate(
				{ id: opening.id, applicationId: app.id },
				{
					onSuccess: (res) =>
						toast.success('Accepted — the job is waiting for them to confirm', {
							actionText: 'Open job',
							onAction: () => res?.job?._id && navigate(jobPath(res.job._id)),
						}),
				}
			);
	};

	const onReject = async (app) => {
		const ok = await confirmRef.current.ask({
			title: 'Turn this application down?',
			text: 'They’ll see it wasn’t chosen.',
			confirmLabel: 'Turn down',
		});
		if (ok)
			reject.mutate(
				{ id: opening.id, applicationId: app.id },
				{ onSuccess: () => toast.success('Turned down') }
			);
	};

	const onApply = async () => {
		const message = await messageRef.current.ask({
			eyebrow: myApp ? 'Your application' : 'Apply',
			title: opening.title,
			text: myApp
				? 'Update your note to the poster.'
				: 'Add a short note — your experience with this kind of work, when you can start. Your profile goes with it.',
			label: 'Note to the poster',
			confirmLabel: myApp ? 'Save' : 'Apply',
		});
		if (message === null) return;
		if (myApp)
			updateApp.mutate(
				{ id: opening.id, message },
				{ onSuccess: () => toast.success('Application updated') }
			);
		else
			apply.mutate(
				{ id: opening.id, message },
				{ onSuccess: () => toast.success('Applied — the poster will see it') }
			);
	};

	const onWithdraw = async () => {
		const ok = await confirmRef.current.ask({
			title: 'Withdraw your application?',
			text: 'You can’t apply to this job again afterwards.',
			confirmLabel: 'Withdraw',
		});
		if (ok)
			withdraw.mutate(opening.id, {
				onSuccess: () => toast.success('Application withdrawn'),
			});
	};

	const onRemoveFile = async (file) => {
		const ok = await confirmRef.current.ask({
			title: 'Remove this photo?',
			text: file.fileName,
			confirmLabel: 'Remove',
		});
		if (ok) removeFile.mutate({ id: opening.id, fileName: file.fileName });
	};

	return (
		<>
			{back}
			<PageHeader
				eyebrow={skillLabel(opening.category)}
				title={opening.title}
				subtitle={[
					placeText(opening.generalArea),
					`Posted ${formatDate(opening.createdAt)}`,
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
								Cancel job
							</AppButton>
						</>
					)
				}
			/>

			<div className="mb-6 flex flex-wrap items-center gap-3">
				<StatusBadge status={opening.status} map={OPENING_STATUS_BADGES} />
				{accepted && (
					<AppButton to={ROUTES.DASHBOARD_JOBS} icon={<LuHandshake />}>
						Go to your jobs
					</AppButton>
				)}
			</div>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div className="flex min-w-0 flex-col gap-5">
					<Panel title="The work" icon={<LuFileText aria-hidden="true" />}>
						<p className="text-[15px] leading-relaxed whitespace-pre-line text-(--pg-text-primary)">
							{opening.description}
						</p>
					</Panel>

					<ExactTier
						opening={opening}
						unlocked={unlocked}
						isPoster={isPoster}
						files={files}
					>
						<FileList
							files={files}
							onRemove={isPoster && open ? onRemoveFile : undefined}
							removing={removeFile.isPending}
						/>
						{isPoster && open && files.length < MAX_OPENING_FILES && (
							<div className="mt-4 flex flex-col gap-3">
								<CustomFile
									label="Add photos"
									multiple
									compact
									maxFiles={MAX_OPENING_FILES - files.length}
									accept={PORTFOLIO_ACCEPT}
									acceptLabel="JPG, PNG or AVIF"
									value={newFiles}
									onChange={setNewFiles}
								/>
								{newFiles.length > 0 && (
									<div>
										<AppButton
											onClick={() =>
												addFiles.mutate(
													{ id: opening.id, files: newFiles },
													{
														onSuccess: (res) => {
															setNewFiles([]);
															if (res.fileWarnings?.length)
																toast.warning(res.fileWarnings.join(' · '));
															else toast.success('Photos added');
														},
													}
												)
											}
											disabled={addFiles.isPending}
										>
											{addFiles.isPending
												? 'Uploading…'
												: `Upload ${newFiles.length}`}
										</AppButton>
									</div>
								)}
							</div>
						)}
					</ExactTier>

					{isPoster && (
						<ApplicationsPanel
							opening={opening}
							onAccept={onAccept}
							onReject={onReject}
							busy={accept.isPending || reject.isPending}
						/>
					)}
				</div>

				<aside className="flex flex-col gap-5">
					<Panel title="At a glance">
						<dl className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<Fact label="Pay">{payText(opening)}</Fact>
							</div>
							<Fact label="Workers">
								{opening.filledCount || 0} of {opening.workersNeeded} filled
							</Fact>
							<Fact label="Length">
								{EMPLOYMENT_TYPE_LABELS[opening.employmentType]}
							</Fact>
							<div className="col-span-2">
								<Fact label="General area">
									{placeText(opening.generalArea)}
								</Fact>
							</div>
							{opening.applicationDeadline && (
								<div className="col-span-2">
									<Fact
										label={
											isPast(opening.applicationDeadline)
												? 'Applications closed'
												: 'Applications close'
										}
									>
										{formatDate(opening.applicationDeadline)}
									</Fact>
								</div>
							)}
						</dl>
					</Panel>

					{!isPoster && (
						<Panel
							title="Your application"
							icon={<LuSend aria-hidden="true" />}
						>
							{myApps.isPending ? (
								<AppLoader />
							) : myApp ? (
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3">
										<span className="text-sm text-(--pg-text-secondary)">
											Applied {formatDate(myApp.createdAt)}
										</span>
										<StatusBadge
											status={myApp.status}
											map={APPLICATION_STATUS_BADGES}
										/>
									</div>
									{myApp.message && (
										<p className="text-sm whitespace-pre-line text-(--pg-text-primary)">
											{myApp.message}
										</p>
									)}
									{myApp.status === 'pending' && applying && (
										<div className="flex flex-wrap gap-2">
											<AppButton
												variant="secondary"
												icon={<LuPencil />}
												onClick={onApply}
											>
												Edit note
											</AppButton>
											<AppButton
												variant="secondary"
												onClick={onWithdraw}
												disabled={withdraw.isPending}
											>
												Withdraw
											</AppButton>
										</div>
									)}
									{accepted && (
										<p className="text-sm text-(--pg-status-success)">
											You’re in — the exact site is unlocked. Confirm the job in
											Jobs to get started.
										</p>
									)}
								</div>
							) : applying ? (
								<div className="flex flex-col gap-3">
									<p className="text-sm text-(--pg-text-secondary)">
										The poster sees your profile and note. Other applicants
										never see yours.
									</p>
									<AppButton
										icon={<LuArrowRight />}
										onClick={onApply}
										disabled={apply.isPending}
									>
										Apply
									</AppButton>
								</div>
							) : (
								<p className="text-sm text-(--pg-text-secondary)">
									This job isn’t taking applications any more.
								</p>
							)}
						</Panel>
					)}
				</aside>
			</div>

			<ConfirmModal refName={confirmRef} />
			<ReasonModal refName={messageRef} />
			{isPoster && (
				<EditOpeningModal
					refName={editRef}
					opening={opening}
					isPending={update.isPending}
					onSubmit={(values) =>
						update.mutate(
							{ id: opening.id, ...values },
							{
								onSuccess: () => {
									editRef.current.close();
									toast.success('Job updated');
								},
							}
						)
					}
				/>
			)}
		</>
	);
}

export default JobOpeningDetail;
