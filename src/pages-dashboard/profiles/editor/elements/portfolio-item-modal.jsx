import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal from '../../../../components/modal/index_modal';
import { AppButton } from '../../../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomTags,
	CustomDate,
	CustomFile,
} from '../../../../components/form-components';
import { toDateValue } from '../../../../components/form-components/helpers';
import { portfolioItemSchema } from '../../../../features/validations/profile-validation';
import {
	PORTFOLIO_ACCEPT,
	MAX_MEDIA_PER_ITEM,
} from '../../../../utilities/app-const';

// A portfolio project's details. New: details plus its first images in
// one multipart POST /me/portfolio. Editing (`item`): the text and dates
// only, PATCH /me/portfolio/:itemId — images are managed separately;
// a cleared date is sent as null to remove it.
function PortfolioItemModal({ refName, item, onSubmit, isPending }) {
	const editing = Boolean(item);
	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			title: item?.title || '',
			description: item?.description || '',
			tags: item?.tags || [],
			startedAt: toDateValue(item?.startedAt),
			completedAt: toDateValue(item?.completedAt),
			media: [],
		},
		validationSchema: portfolioItemSchema,
		onSubmit: (values) =>
			onSubmit({
				fields: editing
					? {
							title: values.title.trim(),
							description: values.description.trim(),
							tags: values.tags,
							startedAt: values.startedAt || null,
							completedAt: values.completedAt || null,
						}
					: {
							title: values.title.trim(),
							...(values.description.trim() && {
								description: values.description.trim(),
							}),
							tags: values.tags,
							...(values.startedAt && { startedAt: values.startedAt }),
							...(values.completedAt && { completedAt: values.completedAt }),
						},
				files: values.media,
			}),
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;

	return (
		<Modal.Center
			refName={refName}
			width="640px"
			queryWidth="100%"
			onClose={() => form.resetForm()}
		>
			<Modal.Card
				eyebrow="Portfolio"
				title={editing ? 'Edit project' : 'Add a project'}
				subtitle="Show finished or ongoing work — photos, drawings, site progress."
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton
							type="submit"
							form="portfolio-item-form"
							disabled={isPending}
						>
							{isPending ? 'Saving…' : editing ? 'Save changes' : 'Add project'}
						</AppButton>
					</>
				}
			>
				<form
					id="portfolio-item-form"
					noValidate
					onSubmit={form.handleSubmit}
					className="grid gap-5 sm:grid-cols-2"
				>
					<div className="sm:col-span-2">
						<CustomInput
							label="Project title"
							name="title"
							required
							placeholder="e.g. Lekki residential block — structural design"
							value={form.values.title}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('title')}
							errormessage={form.errors.title}
						/>
					</div>
					<div className="sm:col-span-2">
						<CustomTextarea
							label="Description"
							name="description"
							minHeight="110px"
							maxLength={1500}
							placeholder="Your role, the scope, anything notable about the design or site."
							value={form.values.description}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							isError={err('description')}
							errormessage={form.errors.description}
						/>
					</div>
					<CustomDate
						label="Started"
						name="startedAt"
						value={form.values.startedAt}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
					/>
					<CustomDate
						label="Completed"
						name="completedAt"
						hint="Leave empty if ongoing"
						min={form.values.startedAt || undefined}
						value={form.values.completedAt}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						isError={err('completedAt')}
						errormessage={form.errors.completedAt}
					/>
					<div className="sm:col-span-2">
						<CustomTags
							label="Tags"
							name="tags"
							max={8}
							value={form.values.tags}
							setFieldValue={form.setFieldValue}
							isError={err('tags')}
							errormessage={form.errors.tags}
						/>
					</div>
					{!editing && (
						<div className="sm:col-span-2">
							<CustomFile
								label="Images"
								name="media"
								multiple
								maxFiles={MAX_MEDIA_PER_ITEM}
								accept={PORTFOLIO_ACCEPT}
								acceptLabel="JPG, PNG or AVIF"
								value={form.values.media}
								onChange={(files) => form.setFieldValue('media', files)}
								isError={err('media')}
								errormessage={form.errors.media}
							/>
						</div>
					)}
				</form>
			</Modal.Card>
		</Modal.Center>
	);
}

PortfolioItemModal.propTypes = {
	item: PropTypes.object,
	refName: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default PortfolioItemModal;
