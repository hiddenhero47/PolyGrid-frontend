import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
	LuPlus,
	LuImage,
	LuTrash2,
	LuPencil,
	LuImagePlus,
	LuX,
	LuFolderOpen,
} from 'react-icons/lu';
import ProfileServices from '../../../../../features/services/custom-hooks/profiles';
import { toast } from '../../../../../layouts/toast/toast-handler';
import Modal from '../../../../../components/modal/index_modal';
import ConfirmModal from '../../../../../components/modal/confirm-modal';
import EmptyState from '../../../../../components/empty-state';
import { AppButton } from '../../../../../components/button';
import { CustomFile } from '../../../../../components/form-components';
import { Chip } from '../../../../home/elements/index.style';
import {
	MAX_PORTFOLIO_ITEMS,
	MAX_MEDIA_PER_ITEM,
	PORTFOLIO_ACCEPT,
} from '../../../../../utilities/app-const';
import { formatDate } from '../../../../../utilities/basic-functions';
import PortfolioItemModal from './portfolio-item-modal';
import { PortfolioCard, MediaGrid } from './portfolio.style';

const dates = (item) =>
	[
		formatDate(item.startedAt),
		item.completedAt
			? formatDate(item.completedAt)
			: item.startedAt
				? 'ongoing'
				: '',
	]
		.filter(Boolean)
		.join(' – ');

const warnSkipped = (res) =>
	res?.mediaWarnings?.length &&
	toast.warning(res.mediaWarnings.join(' · '), {
		title: 'Some images were skipped',
	});

// Portfolio manager (frontend-plan §B.3a): up to 20 projects, 6 images
// each. Add a project with its first images; afterwards add or remove
// images, or delete the project.
function PortfolioTab({ profileType, profile }) {
	const type = profileType;
	const addRef = useRef(null);
	const manageRef = useRef(null);
	const confirmRef = useRef(null);
	const [activeId, setActiveId] = useState(null);
	const [newImages, setNewImages] = useState([]);
	const [editing, setEditing] = useState(null); // item being edited in the details modal

	const addItem = ProfileServices.addPortfolioItem(type);
	const updateItem = ProfileServices.updatePortfolioItem(type);
	const addMedia = ProfileServices.addPortfolioMedia(type);
	const removeMedia = ProfileServices.removePortfolioMedia(type);
	const removeItem = ProfileServices.removePortfolioItem(type);

	const items = profile.portfolio || [];
	// read from the live profile so the modal reflects every change
	const active = items.find((item) => item._id === activeId);
	const room = active ? MAX_MEDIA_PER_ITEM - active.media.length : 0;

	const openManage = (item) => {
		setActiveId(item._id);
		setNewImages([]);
		manageRef.current.open();
	};

	const handleSave = (payload) => {
		if (editing) {
			updateItem.mutate(
				{ itemId: editing._id, ...payload.fields },
				{
					onSuccess: () => {
						addRef.current.close();
						toast.success('Project updated');
					},
				}
			);
			return;
		}
		addItem.mutate(payload, {
			onSuccess: (res) => {
				addRef.current.close();
				toast.success('Project added');
				warnSkipped(res);
			},
		});
	};

	const openAdd = () => {
		setEditing(null);
		addRef.current.open();
	};

	const openEdit = () => {
		setEditing(active);
		manageRef.current.close();
		addRef.current.open();
	};

	const uploadImages = () =>
		addMedia.mutate(
			{ itemId: active._id, files: newImages },
			{
				onSuccess: (res) => {
					setNewImages([]);
					toast.success('Images added');
					warnSkipped(res);
				},
			}
		);

	const deleteImage = async (media) => {
		const ok = await confirmRef.current.ask({
			title: 'Remove this image?',
			confirmLabel: 'Remove',
		});
		if (ok)
			removeMedia.mutate({ itemId: active._id, fileName: media.fileName });
	};

	const deleteItem = async () => {
		const ok = await confirmRef.current.ask({
			title: 'Delete this project?',
			text: `“${active.title}” and its ${active.media.length} image${active.media.length === 1 ? '' : 's'} will be removed for good.`,
			confirmLabel: 'Delete project',
		});
		if (!ok) return;
		removeItem.mutate(active._id, {
			onSuccess: () => {
				manageRef.current.close();
				toast.success('Project deleted');
			},
		});
	};

	return (
		<>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[15px] text-(--pg-text-secondary)">
					{items.length} of {MAX_PORTFOLIO_ITEMS} projects · up to{' '}
					{MAX_MEDIA_PER_ITEM} images each.
				</p>
				<AppButton
					size="sm"
					icon={<LuPlus />}
					disabled={items.length >= MAX_PORTFOLIO_ITEMS}
					onClick={openAdd}
				>
					Add project
				</AppButton>
			</div>

			{items.length === 0 ? (
				<EmptyState
					compact
					tone="accent"
					icon={<LuFolderOpen />}
					title="No projects yet"
					text="Clients hire on evidence — add a few projects with photos or drawings."
				/>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
					{items.map((item) => {
						const cover = item.media?.[0];
						return (
							<PortfolioCard
								key={item._id}
								type="button"
								onClick={() => openManage(item)}
							>
								<span className="sc_cover" aria-hidden="true">
									{cover ? (
										<img src={cover.url} alt="" loading="lazy" />
									) : (
										<LuImage />
									)}
									<span className="sc_count">
										<LuImage /> {item.media.length}
									</span>
								</span>
								<span className="sc_body">
									<span className="sc_title">{item.title}</span>
									{dates(item) && (
										<span className="sc_dates">{dates(item)}</span>
									)}
								</span>
							</PortfolioCard>
						);
					})}
				</div>
			)}

			<PortfolioItemModal
				refName={addRef}
				item={editing}
				onSubmit={handleSave}
				isPending={addItem.isPending || updateItem.isPending}
			/>

			<Modal.Center
				refName={manageRef}
				width="720px"
				queryWidth="100%"
				onClose={() => setActiveId(null)}
			>
				{active && (
					<Modal.Card
						eyebrow={dates(active) || 'Portfolio'}
						title={active.title}
						footer={
							<>
								<AppButton
									variant="secondary"
									icon={<LuTrash2 />}
									onClick={deleteItem}
									disabled={removeItem.isPending}
								>
									Delete project
								</AppButton>
								<AppButton icon={<LuPencil />} onClick={openEdit}>
									Edit details
								</AppButton>
							</>
						}
					>
						<div className="flex flex-col gap-5">
							{active.description && (
								<p className="text-[15px] leading-relaxed whitespace-pre-line text-(--pg-text-secondary)">
									{active.description}
								</p>
							)}
							{active.tags?.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{active.tags.map((tag) => (
										<Chip key={tag}>{tag}</Chip>
									))}
								</div>
							)}

							<MediaGrid>
								{active.media.map((media) => (
									<li key={media.fileName}>
										<img src={media.url} alt="" loading="lazy" />
										<button
											type="button"
											onClick={() => deleteImage(media)}
											disabled={removeMedia.isPending}
											aria-label="Remove image"
										>
											<LuX aria-hidden="true" />
										</button>
									</li>
								))}
							</MediaGrid>

							{room > 0 ? (
								<div className="flex flex-col gap-3">
									<CustomFile
										label="Add images"
										multiple
										compact
										maxFiles={room}
										accept={PORTFOLIO_ACCEPT}
										acceptLabel="JPG, PNG or AVIF"
										value={newImages}
										onChange={setNewImages}
									/>
									{newImages.length > 0 && (
										<div>
											<AppButton
												icon={<LuImagePlus />}
												onClick={uploadImages}
												disabled={addMedia.isPending}
											>
												{addMedia.isPending
													? 'Uploading…'
													: `Upload ${newImages.length} image${newImages.length === 1 ? '' : 's'}`}
											</AppButton>
										</div>
									)}
								</div>
							) : (
								<p className="text-sm text-(--pg-text-secondary)">
									This project has the maximum {MAX_MEDIA_PER_ITEM} images.
								</p>
							)}
						</div>
					</Modal.Card>
				)}
			</Modal.Center>

			<ConfirmModal refName={confirmRef} />
		</>
	);
}

PortfolioTab.propTypes = {
	profileType: PropTypes.string.isRequired,
	profile: PropTypes.object.isRequired,
};

export default PortfolioTab;
