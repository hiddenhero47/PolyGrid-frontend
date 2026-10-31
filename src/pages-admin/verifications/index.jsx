import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LuInbox, LuCloudOff, LuRotateCw, LuPartyPopper } from 'react-icons/lu';
import AdminServices from '../../features/services/custom-hooks/admin';
import AdminPageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import EmptyState from '../../components/empty-state';
import Pagination from '../../components/pagination';
import { AppButton } from '../../components/button';
import { CustomSelect } from '../../components/form-components';
import { SkeletonBar } from '../../components/table/index.style';
import {
	MANAGE_ROLES,
	PROFILE_TYPE,
	PROFILE_TYPE_LABELS,
	VERIFICATION_STATUS,
} from '../../utilities/app-const';
import { enumToOptions } from '../../utilities/basic-functions';
import SegmentedControl from '../../components/segmented-control';
import VerificationCard from './elements/verification-card';
import RejectModal from './elements/reject-modal';
import ProfileReview from './elements/profile-review';
import Modal from '../../components/modal/index_modal';

const LIMIT = 10;

const TABS = [
	{ value: VERIFICATION_STATUS.PENDING, label: 'Pending' },
	{ value: VERIFICATION_STATUS.APPROVED, label: 'Approved' },
	{ value: VERIFICATION_STATUS.REJECTED, label: 'Rejected' },
	{ value: 'all', label: 'All' },
];

const PROFILE_OPTIONS = enumToOptions(PROFILE_TYPE, PROFILE_TYPE_LABELS);

// frontend-plan §C — Verification queue. Approving flips the profile's
// isVerified; a consultant also needs an active subscription to show on
// /engineering, hence "Grant a plan" on approved cards.
// Filters in the URL: ?status=&profileType=&page=
function AdminVerifications() {
	const [params, setParams] = useSearchParams();
	const { user } = useSelector((state) => state.auth);
	const canManage = MANAGE_ROLES.includes(user?.systemRole);
	const rejectRef = useRef(null);
	const profileRef = useRef(null);
	const [rejecting, setRejecting] = useState(null);
	const [viewing, setViewing] = useState(null);

	const status = params.get('status') || VERIFICATION_STATUS.PENDING;
	const profileType = params.get('profileType') || '';
	const page = Math.max(Number(params.get('page')) || 1, 1);

	const { data, isPending, isError, isFetching, refetch } =
		AdminServices.getVerifications({
			status: status === 'all' ? '' : status,
			profileType,
			page,
			limit: LIMIT,
		});
	const approve = AdminServices.approveVerification();
	const reject = AdminServices.rejectVerification();
	const items = data?.data ?? [];

	const setFilter = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([key, value]) => {
			if (value) next.set(key, value);
			else next.delete(key);
		});
		next.delete('page');
		setParams(next);
	};

	const changePage = (nextPage) => {
		const next = new URLSearchParams(params);
		if (nextPage > 1) next.set('page', String(nextPage));
		else next.delete('page');
		setParams(next);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleApprove = (verification) =>
		approve.mutate(verification._id, {
			onSuccess: () =>
				toast.success(
					`${verification.user?.fullName || 'Profile'} is verified`
				),
		});

	const openProfile = (verification) => {
		setViewing(verification);
		profileRef.current.open();
	};

	const openReject = (verification) => {
		setRejecting(verification);
		rejectRef.current.open();
	};

	const handleReject = (reason) =>
		reject.mutate(
			{ id: rejecting._id, reason },
			{
				onSuccess: () => {
					rejectRef.current.close();
					toast.success('Verification rejected — the user can resubmit');
				},
			}
		);

	return (
		<>
			<AdminPageHeader
				eyebrow="Review queue"
				title="Verifications"
				subtitle="Check each submission’s details and documents, then approve or reject it. Approving marks the business profile as verified."
			/>

			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<SegmentedControl
					label="Status"
					options={TABS}
					value={status}
					onChange={(value) =>
						setFilter({
							status: value === VERIFICATION_STATUS.PENDING ? '' : value,
						})
					}
				/>
				<div className="w-full lg:w-65">
					<CustomSelect
						name="profileType"
						label="Profile type"
						placeholder="All profile types"
						variant="outline"
						clearable
						options={PROFILE_OPTIONS}
						value={profileType}
						onChange={(value) => setFilter({ profileType: value })}
					/>
				</div>
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
							<SkeletonBar $width="55%" />
						</div>
					))}
				</div>
			)}

			{isError && (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load the queue"
					text="Check your connection and try again."
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
					tone={status === VERIFICATION_STATUS.PENDING ? 'success' : 'neutral'}
					icon={
						status === VERIFICATION_STATUS.PENDING ? (
							<LuPartyPopper />
						) : (
							<LuInbox />
						)
					}
					title={
						status === VERIFICATION_STATUS.PENDING
							? 'Queue is clear'
							: 'Nothing here'
					}
					text={
						status === VERIFICATION_STATUS.PENDING
							? 'No submissions are waiting for review.'
							: 'No verifications match these filters.'
					}
				/>
			)}

			{items.length > 0 && (
				<div
					className="flex flex-col gap-4 transition-opacity"
					style={{ opacity: isFetching && !isPending ? 0.6 : 1 }}
				>
					{items.map((verification) => (
						<VerificationCard
							key={verification._id}
							verification={verification}
							canManage={canManage}
							onApprove={handleApprove}
							onReject={openReject}
							onViewProfile={openProfile}
							busy={approve.isPending && approve.variables === verification._id}
						/>
					))}
				</div>
			)}

			{data?.pagination?.totalPages > 1 && (
				<div className="mt-6">
					<Pagination pagination={data.pagination} changePage={changePage} />
				</div>
			)}

			<Modal.Right
				refName={profileRef}
				width="520px"
				queryWidth="100%"
				onClose={() => setViewing(null)}
			>
				<Modal.Card
					eyebrow="Under review"
					title={viewing?.user?.fullName || 'Profile'}
					subtitle={viewing?.user?.email}
				>
					{viewing && (
						<ProfileReview
							profileType={viewing.profileType}
							profileId={String(viewing.profileId)}
						/>
					)}
				</Modal.Card>
			</Modal.Right>

			{canManage && (
				<RejectModal
					refName={rejectRef}
					verification={rejecting}
					onSubmit={handleReject}
					isPending={reject.isPending}
				/>
			)}
		</>
	);
}

export default AdminVerifications;
