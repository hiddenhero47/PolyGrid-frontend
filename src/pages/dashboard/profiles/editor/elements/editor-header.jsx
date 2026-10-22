import React from 'react';
import PropTypes from 'prop-types';
import { LuCamera, LuExternalLink } from 'react-icons/lu';
import ProfileServices from '../../../../../features/services/custom-hooks/profiles';
import { toast } from '../../../../../layouts/toast/toast-handler';
import ProfileAvatar from '../../../../../components/profile-avatar';
import StatusBadge from '../../../../../components/status-badge';
import { AppButton } from '../../../../../components/button';
import { CustomToggle } from '../../../../../components/form-components';
import { AVATAR_ACCEPT } from '../../../../../utilities/app-const';
import { profileTypeMeta } from '../../../elements/profile-types';
import { EditorHeader as Header } from './index.style';

const MAX_AVATAR = 10 * 1024 * 1024;

// Avatar (replace only — the profile falls back to the account photo
// until one is set), name, verified badge, the public page link (once
// that pillar has one) and the active / on-a-break switch (never
// `banned` — that's admin-only).
function EditorHeader({ profileType, config, profile }) {
	const upload = ProfileServices.uploadAvatar(profileType);
	const update = ProfileServices.updateProfile(profileType);
	const name = profile[config.nameField];
	const publicPath = profileTypeMeta(profileType)?.publicPath;
	const banned = profile.status === 'banned';

	const pickAvatar = (e) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		if (!AVATAR_ACCEPT.split(',').includes(file.type)) {
			toast.error('Use a JPG, PNG, WebP or AVIF image');
			return;
		}
		if (file.size > MAX_AVATAR) {
			toast.error('That image is over 10 MB');
			return;
		}
		upload.mutate(file, {
			onSuccess: () =>
				toast.success(
					config.imageField === 'logo' ? 'Logo updated' : 'Photo updated'
				),
		});
	};

	const setActive = (e) =>
		update.mutate(
			{ status: e.target.checked ? 'active' : 'inactive' },
			{
				onSuccess: (res) =>
					toast.success(
						res.status === 'active'
							? 'You’re active again'
							: 'On a break — this profile is paused'
					),
			}
		);

	return (
		<Header>
			<div className="sc_avatarWrap">
				<ProfileAvatar
					avatar={profile[config.imageField || 'avatar']}
					name={name}
					size={84}
				/>
				<label className="sc_avatarBtn" title="Replace photo">
					<LuCamera aria-hidden="true" />
					<span className="sr-only">
						{config.imageField === 'logo'
							? 'Replace logo'
							: 'Replace profile photo'}
					</span>
					<input
						type="file"
						accept={AVATAR_ACCEPT}
						onChange={pickAvatar}
						disabled={upload.isPending}
					/>
				</label>
			</div>

			<div className="min-w-0 flex-1">
				<p className="font-label text-[11px] font-semibold tracking-[0.16em] text-(--pg-text-highlight) uppercase">
					{config.label}
				</p>
				<h2 className="sc_name mt-1">{name}</h2>
				<div className="mt-2.5 flex flex-wrap items-center gap-2">
					<StatusBadge
						label={profile.isVerified ? 'Verified' : 'Not verified'}
						tone={profile.isVerified ? 'success' : 'warning'}
					/>
					{banned && <StatusBadge label="Banned" tone="error" />}
					{upload.isPending && (
						<span className="text-sm text-(--pg-text-secondary)">
							Uploading photo…
						</span>
					)}
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-4">
				{!banned && (
					<CustomToggle
						name="status"
						checked={profile.status === 'active'}
						onChange={setActive}
						disabled={update.isPending}
					>
						Active
					</CustomToggle>
				)}
				{publicPath && (
					<AppButton
						size="sm"
						variant="secondary"
						href={publicPath(profile)}
						target="_blank"
						icon={<LuExternalLink />}
					>
						Public page
					</AppButton>
				)}
			</div>
		</Header>
	);
}

EditorHeader.propTypes = {
	profileType: PropTypes.string.isRequired,
	config: PropTypes.object.isRequired,
	profile: PropTypes.object.isRequired,
};

export default EditorHeader;
