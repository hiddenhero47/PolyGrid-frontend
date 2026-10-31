import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { LuPlus, LuTrash2, LuX, LuImagePlus } from 'react-icons/lu';
import ProductServices from '../../../../../features/services/custom-hooks/products';
import ReferenceServices from '../../../../../features/services/custom-hooks/reference';
import { toast } from '../../../../../layouts/toast/toast-handler';
import Modal from '../../../../../components/modal/index_modal';
import ConfirmModal from '../../../../../components/modal/confirm-modal';
import { AppButton } from '../../../../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomSelect,
	CustomFile,
} from '../../../../../components/form-components';
import { storeProductSchema } from '../../../../../features/validations/profile-validation';
import {
	PLATFORM_CURRENCY,
	STOCK_STATUS,
	MAX_PRODUCT_IMAGES,
	MAX_SHIPPING_LOCATIONS,
	PRODUCT_IMAGE_ACCEPT,
	MATERIAL_CATEGORY_LABELS,
} from '../../../../../utilities/app-const';
import {
	enumToOptions,
	humanize,
} from '../../../../../utilities/basic-functions';
import { MediaGrid } from '../portfolio.style';
import ShippingRow from './shipping-row';

const UNITS = [
	'bag',
	'ton',
	'piece',
	'bundle',
	'roll',
	'meter',
	'square meter',
	'cubic meter',
	'sheet',
	'length',
	'pack',
	'litre',
];
const STOCK_OPTIONS = enumToOptions(STOCK_STATUS);

const blankRow = (country = '') => ({ country, state: '', price: '' });

const fromProduct = (product, storeCountry) => ({
	title: product?.title || '',
	category: product?.category || '',
	subCategory: product?.subCategory || '',
	description: product?.description || '',
	price: product?.price ?? '',
	unit: product?.unit || '',
	stockStatus: product?.stockStatus || STOCK_STATUS.IN_STOCK,
	shippingLocations: product?.shippingLocations?.length
		? product.shippingLocations.map((l) => ({
				country: l.country,
				state: l.state || '',
				price: l.price,
			}))
		: [blankRow(storeCountry)],
	images: [],
});

// Add or edit a store product (frontend-plan §B.3d). New: details,
// delivery locations and first images in one multipart POST. Editing:
// details via PATCH, images added / removed on their own, delete.
// Categories are limited to the store's own.
function StoreProductModal({ refName, product, store, onClose }) {
	const editing = Boolean(product);
	const confirmRef = useRef(null);
	const [newImages, setNewImages] = useState([]);
	const { data: countryList = [] } = ReferenceServices.getCountries();
	const countries = countryList.map((c) => ({
		value: c.isoCode,
		label: c.name,
	}));

	const create = ProductServices.createStoreProduct();
	const update = ProductServices.updateStoreProduct();
	const remove = ProductServices.deleteStoreProduct();
	const addImages = ProductServices.addStoreProductImages();
	const removeImage = ProductServices.removeStoreProductImage();

	const categoryOptions = (store?.categories || []).map((value) => ({
		value,
		label: MATERIAL_CATEGORY_LABELS[value] || humanize(value),
	}));

	const form = useFormik({
		enableReinitialize: true,
		initialValues: fromProduct(product, store?.country),
		validationSchema: storeProductSchema(MAX_SHIPPING_LOCATIONS),
		onSubmit: (values) => {
			const fields = {
				title: values.title.trim(),
				category: values.category,
				subCategory: values.subCategory.trim(),
				description: values.description.trim(),
				price: Number(values.price),
				currency: PLATFORM_CURRENCY,
				unit: values.unit.trim(),
				shippingLocations: values.shippingLocations.map((r) => ({
					country: r.country,
					...(r.state && { state: r.state }),
					price: Number(r.price),
				})),
			};
			const done = (message) => (res) => {
				refName.current.close();
				toast.success(message);
				if (res?.mediaWarnings?.length) {
					toast.warning(res.mediaWarnings.join(' · '), {
						title: 'Some images were skipped',
					});
				}
			};
			if (editing) {
				update.mutate(
					{ id: product.id, ...fields, stockStatus: values.stockStatus },
					{ onSuccess: done('Product saved') }
				);
			} else {
				if (!fields.subCategory) delete fields.subCategory;
				if (!fields.description) delete fields.description;
				create.mutate(
					{ fields, images: values.images },
					{ onSuccess: done('Product added') }
				);
			}
		},
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;
	const shippingError =
		typeof form.errors.shippingLocations === 'string' && form.submitCount > 0
			? form.errors.shippingLocations
			: null;

	const deleteProduct = async () => {
		const ok = await confirmRef.current.ask({
			title: 'Delete this product?',
			text: `“${product.title}” and its images will be removed for good.`,
			confirmLabel: 'Delete product',
		});
		if (!ok) return;
		remove.mutate(product.id, {
			onSuccess: () => {
				refName.current.close();
				toast.success('Product deleted');
			},
		});
	};

	const room = editing ? MAX_PRODUCT_IMAGES - (product.images?.length || 0) : 0;

	return (
		<>
			<Modal.Center
				refName={refName}
				width="760px"
				queryWidth="100%"
				onClose={() => {
					form.resetForm();
					setNewImages([]);
					onClose?.();
				}}
			>
				<Modal.Card
					eyebrow="Products"
					title={editing ? 'Edit product' : 'Add a product'}
					subtitle="Prices and delivery are in USD."
					footer={
						<>
							{editing && (
								<AppButton
									variant="secondary"
									icon={<LuTrash2 />}
									onClick={deleteProduct}
									disabled={remove.isPending}
								>
									Delete
								</AppButton>
							)}
							<AppButton
								type="submit"
								form="store-product-form"
								disabled={create.isPending || update.isPending}
							>
								{create.isPending || update.isPending
									? 'Saving…'
									: editing
										? 'Save changes'
										: 'Add product'}
							</AppButton>
						</>
					}
				>
					<FormikProvider value={form}>
						<form
							id="store-product-form"
							noValidate
							onSubmit={form.handleSubmit}
							className="grid gap-5 sm:grid-cols-2"
						>
							<div className="sm:col-span-2">
								<CustomInput
									label="Product"
									name="title"
									required
									placeholder="e.g. Dangote 3X cement, 50kg"
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
								placeholder="One of your store’s categories"
								options={categoryOptions}
								value={form.values.category}
								onChange={(value) => form.setFieldValue('category', value)}
								isError={
									err('category') ||
									(form.submitCount > 0 && Boolean(form.errors.category))
								}
								errormessage={form.errors.category}
							/>
							<CustomInput
								label="Type"
								name="subCategory"
								placeholder="e.g. Portland cement"
								hint="Optional — a finer description than the category"
								value={form.values.subCategory}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
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
							<div>
								<CustomInput
									label="Per"
									name="unit"
									required
									list="product-units"
									placeholder="bag, ton, piece…"
									value={form.values.unit}
									onChange={form.handleChange}
									onBlur={form.handleBlur}
									isError={err('unit')}
									errormessage={form.errors.unit}
								/>
								<datalist id="product-units">
									{UNITS.map((u) => (
										<option key={u} value={u} />
									))}
								</datalist>
							</div>
							{editing && (
								<CustomSelect
									label="Stock"
									name="stockStatus"
									options={STOCK_OPTIONS}
									value={form.values.stockStatus}
									onChange={(value) => form.setFieldValue('stockStatus', value)}
								/>
							)}
							<div className="sm:col-span-2">
								<CustomTextarea
									label="Description"
									name="description"
									minHeight="96px"
									maxLength={1500}
									value={form.values.description}
									onChange={form.handleChange}
									onBlur={form.handleBlur}
									isError={err('description')}
									errormessage={form.errors.description}
								/>
							</div>

							<fieldset className="sm:col-span-2">
								<legend className="font-label mb-1 text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
									Delivery
								</legend>
								<p className="mb-3 text-sm text-(--pg-text-secondary)">
									Where you deliver and what it costs. Leave the state empty to
									cover the whole country; add a state row to price it
									differently.
								</p>
								<FieldArray name="shippingLocations">
									{({ push, remove: removeRow }) => (
										<>
											<ul className="flex flex-col gap-3">
												{form.values.shippingLocations.map((row, index) => (
													<ShippingRow
														key={index}
														index={index}
														row={row}
														countries={countries}
														form={form}
														canRemove={form.values.shippingLocations.length > 1}
														onRemove={() => removeRow(index)}
													/>
												))}
											</ul>
											{shippingError && (
												<p
													role="alert"
													className="mt-2 text-sm text-(--pg-form-error)"
												>
													{shippingError}
												</p>
											)}
											<AppButton
												className="mt-3"
												size="sm"
												variant="secondary"
												icon={<LuPlus />}
												disabled={
													form.values.shippingLocations.length >=
													MAX_SHIPPING_LOCATIONS
												}
												onClick={() => push(blankRow(store?.country))}
											>
												Add location
											</AppButton>
										</>
									)}
								</FieldArray>
							</fieldset>

							{!editing && (
								<div className="sm:col-span-2">
									<CustomFile
										label="Photos"
										multiple
										maxFiles={MAX_PRODUCT_IMAGES}
										accept={PRODUCT_IMAGE_ACCEPT}
										acceptLabel="JPG, PNG or WebP"
										value={form.values.images}
										onChange={(files) => form.setFieldValue('images', files)}
									/>
								</div>
							)}
						</form>
					</FormikProvider>

					{editing && (
						<section className="mt-6 flex flex-col gap-3 border-t border-(--pg-modal-divider) pt-5">
							<h4 className="font-label text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase">
								Photos · {product.images?.length || 0} of {MAX_PRODUCT_IMAGES}
							</h4>
							{product.images?.length > 0 && (
								<MediaGrid>
									{product.images.map((image) => (
										<li key={image.fileName}>
											<img src={image.url} alt="" loading="lazy" />
											<button
												type="button"
												onClick={() =>
													removeImage.mutate({
														id: product.id,
														fileName: image.fileName,
													})
												}
												disabled={removeImage.isPending}
												aria-label="Remove photo"
											>
												<LuX aria-hidden="true" />
											</button>
										</li>
									))}
								</MediaGrid>
							)}
							{room > 0 && (
								<>
									<CustomFile
										label="Add photos"
										multiple
										compact
										maxFiles={room}
										accept={PRODUCT_IMAGE_ACCEPT}
										acceptLabel="JPG, PNG or WebP"
										value={newImages}
										onChange={setNewImages}
									/>
									{newImages.length > 0 && (
										<div>
											<AppButton
												size="sm"
												icon={<LuImagePlus />}
												disabled={addImages.isPending}
												onClick={() =>
													addImages.mutate(
														{ id: product.id, files: newImages },
														{
															onSuccess: () => {
																setNewImages([]);
																toast.success('Photos added');
															},
														}
													)
												}
											>
												{addImages.isPending
													? 'Uploading…'
													: `Upload ${newImages.length}`}
											</AppButton>
										</div>
									)}
								</>
							)}
						</section>
					)}
				</Modal.Card>
			</Modal.Center>
			<ConfirmModal refName={confirmRef} />
		</>
	);
}

StoreProductModal.propTypes = {
	refName: PropTypes.object.isRequired,
	product: PropTypes.object,
	store: PropTypes.object,
	onClose: PropTypes.func,
};

export default StoreProductModal;
