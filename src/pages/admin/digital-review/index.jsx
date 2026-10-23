import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	LuCheck,
	LuUndo2,
	LuEye,
	LuFileText,
	LuImage,
	LuPartyPopper,
	LuInbox,
	LuCloudOff,
	LuRotateCw,
	LuExternalLink,
} from 'react-icons/lu';
import AdminServices from '../../../features/services/custom-hooks/admin';
import PageHeader from '../../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../../layouts/toast/toast-handler';
import Modal from '../../../components/modal/index_modal';
import ConfirmModal from '../../../components/modal/confirm-modal';
import EmptyState from '../../../components/empty-state';
import Pagination from '../../../components/pagination';
import StatusBadge from '../../../components/status-badge';
import SegmentedControl from '../../../components/segmented-control';
import { AppButton } from '../../../components/button';
import { SkeletonBar } from '../../../components/table/index.style';
import { Chip } from '../../home/elements/index.style';
import { ReviewCard } from '../verifications/elements/index.style';
import ProfileReview from '../verifications/elements/profile-review';
import {
	PROFILE_TYPE,
	DIGITAL_PRODUCT_CATEGORY_LABELS,
} from '../../../utilities/app-const';
import {
	countryName,
	formatDate,
	formatMoney,
	humanize,
} from '../../../utilities/basic-functions';

const LIMIT = 10;
const TABS = [
	{ value: 'pending', label: 'Awaiting review' },
	{ value: 'approved', label: 'Approved' },
];

const size = (bytes = 0) =>
	bytes < 1024 * 1024
		? `${Math.max(1, Math.round(bytes / 1024))} KB`
		: `${(bytes / 1048576).toFixed(1)} MB`;

// frontend-plan §C.6 — Digital product review: a listing-authenticity
// check before a creator's file can go on sale. Reviewers can open the
// deliverables themselves (GET /api/digital-products/:id/download). Approve / revoke via
// PATCH /api/digital-products/:id/verify — the one queue customer care
// can act on, so every reviewer role sees the buttons.
// URL: ?status=pending|approved&page=
function DigitalReview() {
	const [params, setParams] = useSearchParams();
	const status = params.get('status') === 'approved' ? 'approved' : 'pending';
	const page = Math.max(Number(params.get('page')) || 1, 1);
	const confirmRef = useRef(null);
	const creatorRef = useRef(null);
	const [creator, setCreator] = useState(null);

	const { data, isPending, isError, isFetching, refetch } =
		AdminServices.getDigitalReview({
			status,
			page,
			limit: LIMIT,
		});
	const verify = AdminServices.setDigitalVerification();
	const links = AdminServices.getDeliverableLinks();

	// Signed links are short-lived, so they're fetched on click. The tab
	// opens first (popup blockers allow it), then goes to the file.
	const openFile = (product, index) => {
		const tab = window.open('', '_blank');
		links.mutate(product.id, {
			onSuccess: ({ files = [] }) => {
				const url = files[index]?.downloadUrl;
				if (!url) return tab?.close();
				if (tab) {
					tab.opener = null;
					tab.location.href = url;
				} else window.open(url, '_blank', 'noopener');
			},
			onError: () => tab?.close(),
		});
	};
	const items = data?.data || [];

	const setStatus = async (product, isVerified) => {
		if (!isVerified) {
			const ok = await confirmRef.current.ask({
				title: 'Revoke this approval?',
				text: `“${product.title}” comes off sale until it’s approved again. Past buyers keep their downloads.`,
				confirmLabel: 'Revoke',
			});
			if (!ok) return;
		}
		verify.mutate(
			{ id: product.id, isVerified },
			{
				onSuccess: () =>
					toast.success(
						isVerified ? `“${product.title}” approved` : 'Approval revoked'
					),
			}
		);
	};

	const viewCreator = (c) => {
		setCreator(c);
		creatorRef.current.open();
	};

	return (
		<>
			<PageHeader
				eyebrow="Review queue"
				title="Digital files"
				subtitle="Check that each file is what it claims to be — real, original work matching its title, category and previews — before it goes on sale."
			/>

			<div className="mb-6">
				<SegmentedControl
					label="Status"
					options={TABS}
					value={status}
					onChange={(value) =>
						setParams(value === 'pending' ? {} : { status: value })
					}
				/>
			</div>

			{isPending && (
				<div className="flex flex-col gap-4">
					{Array.from({ length: 3 }, (_, i) => (
						<div
							key={i}
							className="flex flex-col gap-3 rounded-[18px] border border-(--pg-card-border) p-5"
						>
							<SkeletonBar $width="40%" />
							<SkeletonBar $width="70%" />
							<SkeletonBar $width="100%" style={{ height: 90 }} />
						</div>
					))}
				</div>
			)}

			{isError && (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load the queue"
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
							Retry
						</AppButton>
					}
					role="alert"
				/>
			)}

			{!isPending && !isError && items.length === 0 && (
				<EmptyState
					tone={status === 'pending' ? 'success' : 'neutral'}
					icon={status === 'pending' ? <LuPartyPopper /> : <LuInbox />}
					title={
						status === 'pending' ? 'Queue is clear' : 'Nothing approved yet'
					}
					text={
						status === 'pending'
							? 'No files are waiting for review.'
							: undefined
					}
				/>
			)}

			{items.length > 0 && (
				<div
					className="flex flex-col gap-4 transition-opacity"
					style={{ opacity: isFetching && !isPending ? 0.6 : 1 }}
				>
					{items.map((product) => (
						<ReviewCard key={product.id} aria-labelledby={`dp-${product.id}`}>
							<div className="sc_who">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2.5">
										<h3 id={`dp-${product.id}`} className="sc_name">
											{product.title}
										</h3>
										<Chip $accent>
											{DIGITAL_PRODUCT_CATEGORY_LABELS[product.category] ||
												humanize(product.category)}
										</Chip>
									</div>
									<div className="sc_meta">
										<span>
											{product.price === 0
												? 'Free'
												: formatMoney(product.price, product.currency)}
										</span>
										<span>Uploaded {formatDate(product.createdAt, true)}</span>
										<span>
											by{' '}
											<strong className="text-(--pg-text-primary)">
												{product.creator?.displayName}
											</strong>
											{product.creator?.country &&
												` · ${countryName(product.creator.country)}`}
										</span>
									</div>
								</div>
								<div className="flex flex-wrap gap-2">
									<StatusBadge
										label={product.isVerified ? 'Approved' : 'Awaiting review'}
										tone={product.isVerified ? 'success' : 'warning'}
									/>
									{!product.isActive && (
										<StatusBadge label="Not on sale" tone="neutral" />
									)}
									{product.creator && !product.creator.isVerified && (
										<StatusBadge label="Creator unverified" tone="neutral" />
									)}
								</div>
							</div>

							{product.description && (
								<p className="text-[15px] leading-relaxed whitespace-pre-line text-(--pg-text-secondary)">
									{product.description}
								</p>
							)}

							{product.previewImages?.length > 0 ? (
								<ul className="flex flex-wrap gap-2">
									{product.previewImages.map((image) => (
										<li key={image.fileName}>
											<a
												href={image.url}
												target="_blank"
												rel="noopener noreferrer"
												className="block h-24 w-24 overflow-hidden rounded-xl border border-(--pg-card-border)"
											>
												<img
													src={image.url}
													alt=""
													loading="lazy"
													className="h-full w-full object-cover"
												/>
											</a>
										</li>
									))}
								</ul>
							) : (
								<p className="inline-flex items-center gap-2 text-sm text-(--pg-text-secondary)">
									<LuImage aria-hidden="true" /> No preview images
								</p>
							)}

							<div>
								<p className="font-label mb-2 text-[10.5px] font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
									Deliverables · {product.files?.length || 0}
								</p>
								<ul className="flex flex-wrap gap-2">
									{(product.files || []).map((file, i) => (
										<li key={`${file.fileName}-${i}`}>
											<button
												type="button"
												onClick={() => openFile(product, i)}
												disabled={links.isPending}
												title="Open in a new tab"
												className="inline-flex items-center gap-2 rounded-lg border border-(--pg-chip-border) bg-(--pg-chip-background) px-3 py-1.5 text-sm text-(--pg-chip-text) hover:border-(--pg-card-borderHover) disabled:cursor-progress disabled:opacity-60"
											>
												<LuFileText
													className="text-(--pg-text-highlight)"
													aria-hidden="true"
												/>
												{file.fileName}
												<span className="text-xs text-(--pg-text-secondary)">
													{size(file.size)}
												</span>
												<LuExternalLink aria-hidden="true" />
											</button>
										</li>
									))}
								</ul>
							</div>

							<div className="sc_actions">
								<button
									type="button"
									onClick={() => viewCreator(product.creator)}
									className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--pg-text-link) hover:underline"
								>
									<LuEye aria-hidden="true" /> View creator
								</button>
								<div className="ml-auto flex flex-wrap gap-2.5">
									{product.isVerified ? (
										<AppButton
											size="sm"
											variant="secondary"
											icon={<LuUndo2 />}
											onClick={() => setStatus(product, false)}
											disabled={verify.isPending}
										>
											Revoke
										</AppButton>
									) : (
										<AppButton
											size="sm"
											icon={<LuCheck />}
											onClick={() => setStatus(product, true)}
											disabled={verify.isPending}
										>
											{verify.isPending && verify.variables?.id === product.id
												? 'Approving…'
												: 'Approve'}
										</AppButton>
									)}
								</div>
							</div>
						</ReviewCard>
					))}
				</div>
			)}

			{data?.pagination?.totalPages > 1 && (
				<div className="mt-6">
					<Pagination
						pagination={data.pagination}
						changePage={(next) =>
							setParams({
								...(status === 'approved' && { status }),
								...(next > 1 && { page: String(next) }),
							})
						}
					/>
				</div>
			)}

			<Modal.Right
				refName={creatorRef}
				width="520px"
				queryWidth="100%"
				onClose={() => setCreator(null)}
			>
				<Modal.Card eyebrow="Creator" title={creator?.displayName || 'Creator'}>
					{creator && (
						<ProfileReview
							profileType={PROFILE_TYPE.DIGITAL_CREATOR}
							profileId={String(creator.id)}
						/>
					)}
				</Modal.Card>
			</Modal.Right>
			<ConfirmModal refName={confirmRef} />
		</>
	);
}

export default DigitalReview;
