import React from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { LuSave } from 'react-icons/lu';
import ProfileServices from '../../../../../features/services/custom-hooks/profiles';
import { toast } from '../../../../../layouts/toast/toast-handler';
import { AppButton } from '../../../../../components/button';
import {
	CustomInput,
	CustomTextarea,
	CustomToggle,
	CustomTags,
} from '../../../../../components/form-components';
import { mentorshipSchema } from '../../../../../features/validations/profile-validation';
import { PROFILE_TYPE } from '../../../../../utilities/app-const';

// PolyGrid Engineering's mentorship side: whether this consultant takes
// mentees, on what, and at what rate (USD; empty = free). Saved as the
// `mentorship` object via PATCH /me.
function MentorshipTab({ profile }) {
	const update = ProfileServices.updateProfile(PROFILE_TYPE.CONSULTANCY);
	const mentorship = profile.mentorship || {};

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			isMentor: Boolean(mentorship.isMentor),
			bio: mentorship.bio || '',
			areas: mentorship.areas || [],
			ratePerSession: mentorship.ratePerSession ?? '',
		},
		validationSchema: mentorshipSchema,
		onSubmit: (values) => {
			const next = {
				isMentor: values.isMentor,
				bio: values.bio.trim(),
				areas: values.areas,
			};
			if (values.ratePerSession !== '' && values.ratePerSession != null) {
				next.ratePerSession = Number(values.ratePerSession);
			}
			update.mutate(
				{ mentorship: next },
				{ onSuccess: () => toast.success('Mentorship saved') }
			);
		},
	});
	const err = (name) => (form.touched[name] && form.errors[name]) || false;
	const off = !form.values.isMentor;

	return (
		<form
			noValidate
			onSubmit={form.handleSubmit}
			className="flex max-w-190 flex-col gap-5"
		>
			<CustomToggle
				name="isMentor"
				checked={form.values.isMentor}
				onChange={form.handleChange}
				hint="Shows a Mentor badge and a Mentorship section on your public page."
			>
				I take mentees
			</CustomToggle>

			<CustomTextarea
				label="How you mentor"
				name="bio"
				disabled={off}
				placeholder="Who you help and how — e.g. graduates preparing for registration, design-code reviews, career guidance."
				minHeight="120px"
				maxLength={1000}
				value={form.values.bio}
				onChange={form.handleChange}
				onBlur={form.handleBlur}
				isError={err('bio')}
				errormessage={form.errors.bio}
			/>
			<CustomTags
				label="Areas"
				name="areas"
				disabled={off}
				max={10}
				value={form.values.areas}
				setFieldValue={form.setFieldValue}
				isError={err('areas')}
				errormessage={form.errors.areas}
			/>
			<div className="max-w-80">
				<CustomInput
					label="Rate per session (USD)"
					name="ratePerSession"
					type="number"
					inputMode="decimal"
					min="0"
					disabled={off}
					hint="Leave empty to mentor for free."
					value={form.values.ratePerSession}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					isError={err('ratePerSession')}
					errormessage={form.errors.ratePerSession}
				/>
			</div>

			<div className="flex items-center gap-3">
				<AppButton
					type="submit"
					icon={<LuSave />}
					disabled={update.isPending || !form.dirty}
				>
					{update.isPending ? 'Saving…' : 'Save mentorship'}
				</AppButton>
				{form.dirty && (
					<AppButton variant="secondary" onClick={() => form.resetForm()}>
						Discard
					</AppButton>
				)}
			</div>
		</form>
	);
}

MentorshipTab.propTypes = {
	profile: PropTypes.object.isRequired,
};

export default MentorshipTab;
