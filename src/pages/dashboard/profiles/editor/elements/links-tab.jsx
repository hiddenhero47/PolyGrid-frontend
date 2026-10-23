import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { LuPlus, LuSave, LuTrash2 } from 'react-icons/lu';
import ProfileServices from '../../../../../features/services/custom-hooks/profiles';
import { toast } from '../../../../../layouts/toast/toast-handler';
import { AppButton } from '../../../../../components/button';
import { CustomInput } from '../../../../../components/form-components';
import { linkSchema } from '../../../../../features/validations/profile-validation';
import { ListRow } from './index.style';

const MAX_LINKS = 10; // models/profileLink.ts MAX_PROFILE_LINKS

// External links only (website, LinkedIn, a portfolio site) — never raw
// phone numbers or emails; contact goes through PolyGrid. Saved as one
// array via PATCH /me.
function LinksTab({ profileType, profile }) {
	const update = ProfileServices.updateProfile(profileType);

	const form = useFormik({
		enableReinitialize: true,
		initialValues: { links: profile.links?.length ? profile.links : [] },
		validationSchema: yup.object({
			links: yup.array().of(linkSchema).max(MAX_LINKS),
		}),
		onSubmit: ({ links }) =>
			update.mutate(
				{
					links: links.map(({ label, url }) => ({
						label: label.trim(),
						url: url.trim(),
					})),
				},
				{ onSuccess: () => toast.success('Links saved') }
			),
	});
	const fieldError = (i, key) =>
		(form.touched.links?.[i]?.[key] && form.errors.links?.[i]?.[key]) || false;

	return (
		<FormikProvider value={form}>
			<form
				noValidate
				onSubmit={form.handleSubmit}
				className="flex max-w-215 flex-col gap-4"
			>
				<p className="text-[15px] text-(--pg-text-secondary)">
					Your website or professional pages, up to {MAX_LINKS}. Contact details
					stay private — clients reach you through PolyGrid.
				</p>
				<FieldArray name="links">
					{({ push, remove }) => (
						<>
							<ul className="flex flex-col gap-3">
								{form.values.links.map((link, i) => (
									<ListRow key={i}>
										<div className="grid flex-1 gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
											<CustomInput
												label="Label"
												name={`links.${i}.label`}
												placeholder="Website"
												value={link.label}
												onChange={form.handleChange}
												onBlur={form.handleBlur}
												isError={fieldError(i, 'label')}
												errormessage={form.errors.links?.[i]?.label}
											/>
											<CustomInput
												label="URL"
												name={`links.${i}.url`}
												type="url"
												placeholder="https://"
												value={link.url}
												onChange={form.handleChange}
												onBlur={form.handleBlur}
												isError={fieldError(i, 'url')}
												errormessage={form.errors.links?.[i]?.url}
											/>
										</div>
										<button
											type="button"
											className="sc_iconAction mt-[30px]"
											data-tone="danger"
											onClick={() => remove(i)}
											aria-label={`Remove link ${i + 1}`}
										>
											<LuTrash2 aria-hidden="true" />
										</button>
									</ListRow>
								))}
							</ul>
							<div className="flex flex-wrap items-center gap-3">
								<AppButton
									variant="secondary"
									icon={<LuPlus />}
									disabled={form.values.links.length >= MAX_LINKS}
									onClick={() => push({ label: '', url: '' })}
								>
									Add link
								</AppButton>
								<AppButton
									type="submit"
									icon={<LuSave />}
									disabled={update.isPending || !form.dirty}
								>
									{update.isPending ? 'Saving…' : 'Save links'}
								</AppButton>
							</div>
						</>
					)}
				</FieldArray>
			</form>
		</FormikProvider>
	);
}

LinksTab.propTypes = {
	profileType: PropTypes.string.isRequired,
	profile: PropTypes.object.isRequired,
};

export default LinksTab;
