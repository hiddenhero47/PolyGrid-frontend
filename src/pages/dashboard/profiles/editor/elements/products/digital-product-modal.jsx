import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import {
	LuX,
	LuImagePlus,
	LuFileText,
	LuFilePlus,
	LuTrash2,
} from 'react-icons/lu';
import ProductServices from '../../../../../../features/services/custom-hooks/products';
import { toast } from '../../../../../../layouts/toast/toast-handler';
import Modal from '../../../../../../components/modal/index_modal';
import ConfirmModal from '../../../../../../components/modal/confirm-modal';
import { AppButton } from '../../../../../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomSelect,
	CustomFile,
	CustomToggle,
} from '../../../../../../components/form-components';
import { digitalProductSchema } from '../../../../../../features/validations/profile-validation';
import {
	PLATFORM_CURRENCY,
	DIGITAL_PRODUCT_CATEGORY,
	DIGITAL_PRODUCT_CATEGORY_LABELS,
	MAX_PREVIEW_IMAGES,
	MAX_DELIVERABLE_FILES,
	PRODUCT_IMAGE_ACCEPT,
	DELIVERABLE_ACCEPT,
	DELIVERABLE_ACCEPT_LABEL,
} from '../../../../../../utilities/app-const';
import { enumToOptions } from '../../../../../../utilities/basic-functions';
import { MediaGrid } from '../portfolio.style';

const CATEGORY_OPTIONS = enumToOptions(
	DIGITAL_PRODUCT_CATEGORY,
	DIGITAL_PRODUCT_CATEGORY_LABELS
);

// Deliverables are stored under their original file name, so the backend
// refuses two with the same name (400). Dropping them here first saves a
// failed upload and says why.
const uniqueByName = (files, taken = []) => {
	const seen = new Set(taken);
	const kept = [];
	const dropped = [];
	files.forEach((file) => {
		if (seen.has(file.name)) dropped.push(file.name);
		else {
			seen.add(file.name);
			kept.push(file);
		}
	});
	if (dropped.length) {
		toast.warning(`Rename and add again: ${[...new Set(dropped)].join(', ')}`, {
			title: 'A file with that name is already here',
		});
	}
	return kept;
};

const size = (bytes = 0) =>
	bytes < 1024 * 1024
		? `${Math.max(1, Math.round(bytes / 1024))} KB`
		: `${(bytes / 1048576).toFixed(1)} MB`;

// Add or edit a digital product (frontend-plan §B.3e). New: details +
// public preview images + private deliverables in one multipart POST; it
// then waits for admin review. Editing: details and the active switch
// (PATCH — there's no delete, so past buyers keep their downloads),
// preview images and deliverables added / removed on their own.
function DigitalProductModal({ refName, product, onClose }) {
	const editing = Boolean(product);
	const confirmRef = useRef(null);
	const [newPreviews, setNewPreviews] = useState([]);
	const [newFiles, setNewFiles] = useState([]);

	const create = ProductServices.createDigitalProduct();
	const update = ProductServices.updateDigitalProduct();
	const addPreviews = ProductServices.addPreviewImages();
	const removePreview = ProductServices.removePreviewImage();
	const addFiles = ProductServices.addDeliverables();
	const removeFile = ProductServices.removeDeliverable();

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			title: product?.title || '',
			category: product?.category || '',
			description: product?.description || '',
			price: product?.price ?? '',
			isActive: product?.isActive ?? true,
			previewImages: [],
			files: [],
		},
		validationSchema: digitalProductSchema(!editing),
		onSubmit: (values) => {
			const fields = {
				title: values.title.trim(),
				category: values.category,
				description: values.description.trim(),
				price: Number(values.price),
				currency: PLATFORM_CURRENCY,
			};
			const done = (message) => (res) => {
				refName.current.close();
				toast.success(message);
				if (res?.warnings?.length)
					toast.warning(res.warnings.join(' · '), {
						title: 'Some files were skipped',
					});
			};
			if (editing) {
				update.mutate(
					{ id: product.id, ...fields, isActive: values.isActive },
					{ onSuccess: done('Saved') }
				);
			} else {
				if (!fields.description) delete fields.description;
				create.mutate(
					{ fields, previewImages: values.previewImages, files: values.files },
					{
						onSuccess: done(
							'Uploaded — it goes live once our team approves it'
						),
					}
				);
			}
		},
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	const dropFile = async (file) => {
		const ok = await confirmRef.current.ask({
			title: 'Remove this file?',
			text: `“${file.fileName}” stops being delivered to new buyers. It’s kept for about a day so purchases already in progress still get it.`,
			confirmLabel: 'Remove file',
		});
		if (ok) removeFile.mutate({ id: product.id, fileName: file.fileName });
	};

	const previewRoom = editing
		? MAX_PREVIEW_IMAGES - (product.previewImages?.length || 0)
		: 0;
	const fileRoom = editing
		? MAX_DELIVERABLE_FILES - (product.files?.length || 0)
		: 0;
	const busy = create.isPending || update.isPending;

	return (
		<>
			<Modal.Center
				refName={refName}
				width="720px"
				queryWidth="100%"
				onClose={() => {
					form.resetForm();
					setNewPreviews([]);
					setNewFiles([]);
					onClose?.();
				}}
			>
				<Modal.Card
					eyebrow="Digital products"
					title={editing ? 'Edit file' : 'Sell a file'}
					subtitle={
						editing
							? 'Changes save right away for buyers; deactivate to stop selling it.'
							: 'Preview images are public; deliverables are private and only sent to buyers.'
					}
					footer={
						<AppButton
							type="submit"
							form="digital-product-form"
							disabled={busy}
						>
							{busy ? 'Saving…' : editing ? 'Save changes' : 'Upload'}
						</AppButton>
					}
				>
					<form
						id="digital-product-form"
						noValidate
						onSubmit={form.handleSubmit}
						className="grid gap-5 sm:grid-cols-2"
					>
						<div className="sm:col-span-2">
							<CustomInput
								label="Title"
								name="title"
								required
								placeholder="e.g. 4-bedroom duplex — full architectural set"
								value={form.values.title}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
								isError={err('title')}
								errormessage={form.errors.title}
							/>
						</div>
						<CustomSelect
							label="Category"
							name="category"
							required
							placeholder="Choose"
							options={CATEGORY_OPTIONS}
							value={form.values.category}
							onChange={(value) => form.setFieldValue('category', value)}
							isError={
								err('category') ||
								(form.submitCount > 0 && Boolean(form.errors.category))
							}
							errormessage={form.errors.category}
						/>
						<CustomInput
							label="Price (USD)"
							name="price"
							type="number"
							inputMode="decimal"
							min="0"
							step="0.01"
							required
							value={form.values.price}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('price')}
							errormessage={form.errors.price}
						/>
						<div className="sm:col-span-2">
							<CustomTextarea
								label="Description"
								name="description"
								minHeight="96px"
								maxLength={1500}
								placeholder="What’s in the set, the standard it follows, file formats, sheet sizes."
								value={form.values.description}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
								isError={err('description')}
								errormessage={form.errors.description}
							/>
						</div>
						{editing && (
							<div className="sm:col-span-2">
								<CustomToggle
									name="isActive"
									checked={form.values.isActive}
									onChange={form.handleChange}
									hint="Inactive files can’t be bought; past buyers keep their downloads."
								>
									On sale
								</CustomToggle>
							</div>
						)}
						{!editing && (
							<>
								<div className="sm:col-span-2">
									<CustomFile
										label="Preview images"
										hint="Public — shown on the product page"
										multiple
										maxFiles={MAX_PREVIEW_IMAGES}
										accept={PRODUCT_IMAGE_ACCEPT}
										acceptLabel="JPG, PNG or WebP"
										value={form.values.previewImages}
										onChange={(files) =>
											form.setFieldValue('previewImages', files)
										}
									/>
								</div>
								<div className="sm:col-span-2">
									<CustomFile
										label="Deliverable files"
										required
										hint="Private — only buyers get these"
										multiple
										maxFiles={MAX_DELIVERABLE_FILES}
										accept={DELIVERABLE_ACCEPT}
										acceptLabel={DELIVERABLE_ACCEPT_LABEL}
										value={form.values.files}
										onChange={(files) => {
											form.setFieldValue('files', uniqueByName(files));
											form.setFieldTouched('files', true, false);
										}}
										isError={
											(form.touched.files || form.submitCount > 0) &&
											Boolean(form.errors.files)
										}
										errormessage={form.errors.files}
									/>
								</div>
							</>
						)}
					</form>

					{editing && (
						<div className="mt-6 flex flex-col gap-6 border-t border-(--pg-modal-divider) pt-5">
							<section className="flex flex-col gap-3">
								<h4 className="font-label text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
									Preview images · {product.previewImages?.length || 0} of{' '}
									{MAX_PREVIEW_IMAGES}
								</h4>
								{product.previewImages?.length > 0 && (
									<MediaGrid>
										{product.previewImages.map((image) => (
											<li key={image.fileName}>
												<img src={image.url} alt="" loading="lazy" />
												<button
													type="button"
													onClick={() =>
														removePreview.mutate({
															id: product.id,
															fileName: image.fileName,
														})
													}
													disabled={removePreview.isPending}
													aria-label="Remove preview image"
												>
													<LuX aria-hidden="true" />
												</button>
											</li>
										))}
									</MediaGrid>
								)}
								{previewRoom > 0 && (
									<>
										<CustomFile
											label="Add preview images"
											multiple
											compact
											maxFiles={previewRoom}
											accept={PRODUCT_IMAGE_ACCEPT}
											acceptLabel="JPG, PNG or WebP"
											value={newPreviews}
											onChange={setNewPreviews}
										/>
										{newPreviews.length > 0 && (
											<div>
												<AppButton
													size="sm"
													icon={<LuImagePlus />}
													disabled={addPreviews.isPending}
													onClick={() =>
														addPreviews.mutate(
															{ id: product.id, files: newPreviews },
															{
																onSuccess: () => {
																	setNewPreviews([]);
																	toast.success('Previews added');
																},
															}
														)
													}
												>
													{addPreviews.isPending
														? 'Uploading…'
														: `Upload ${newPreviews.length}`}
												</AppButton>
											</div>
										)}
									</>
								)}
							</section>

							<section className="flex flex-col gap-3">
								<h4 className="font-label text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
									Deliverables · {product.files?.length || 0} of{' '}
									{MAX_DELIVERABLE_FILES}
								</h4>
								<ul className="flex flex-col gap-2">
									{(product.files || []).map((file, index) => (
										<li
											key={`${file.fileName}-${index}`}
											className="flex items-center gap-3 rounded-xl border border-(--pg-card-border) px-3 py-2.5"
										>
											<LuFileText
												className="shrink-0 text-(--pg-text-highlight)"
												aria-hidden="true"
											/>
											<span className="min-w-0 flex-1 truncate text-sm text-(--pg-text-primary)">
												{file.fileName}
											</span>
											<span className="text-xs text-(--pg-text-secondary)">
												{size(file.size)}
											</span>
											<button
												type="button"
												onClick={() => dropFile(file)}
												disabled={
													removeFile.isPending || product.files.length <= 1
												}
												title={
													product.files.length <= 1
														? 'A product needs at least one file'
														: 'Remove'
												}
												aria-label={`Remove ${file.fileName}`}
												className="rounded-lg p-1.5 text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-status-error) disabled:opacity-40"
											>
												<LuTrash2 aria-hidden="true" />
											</button>
										</li>
									))}
								</ul>
								{fileRoom > 0 && (
									<>
										<CustomFile
											label="Add deliverables"
											multiple
											compact
											maxFiles={fileRoom}
											accept={DELIVERABLE_ACCEPT}
											acceptLabel={DELIVERABLE_ACCEPT_LABEL}
											value={newFiles}
											onChange={(files) =>
												setNewFiles(
													uniqueByName(
														files,
														(product.files || []).map((f) => f.fileName)
													)
												)
											}
										/>
										{newFiles.length > 0 && (
											<div>
												<AppButton
													size="sm"
													icon={<LuFilePlus />}
													disabled={addFiles.isPending}
													onClick={() =>
														addFiles.mutate(
															{ id: product.id, files: newFiles },
															{
																onSuccess: () => {
																	setNewFiles([]);
																	toast.success('Files added');
																},
															}
														)
													}
												>
													{addFiles.isPending
														? 'Uploading…'
														: `Upload ${newFiles.length}`}
												</AppButton>
											</div>
										)}
									</>
								)}
							</section>
						</div>
					)}
				</Modal.Card>
			</Modal.Center>
			<ConfirmModal refName={confirmRef} />
		</>
	);
}

DigitalProductModal.propTypes = {
	refName: PropTypes.object.isRequired,
	product: PropTypes.object,
	onClose: PropTypes.func,
};

export default DigitalProductModal;
