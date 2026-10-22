import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
	LuBadgeCheck,
	LuMapPin,
	LuBriefcase,
	LuArrowRight,
	LuImages,
} from 'react-icons/lu';
import ProfileAvatar from '../../../components/profile-avatar';
import RatingStars from '../../../components/rating-stars';
import { Chip } from '../../home/elements/index.style';
import { ConsultantCardShell as CardShell } from '../../engineering/elements/index.style';
import { countryName } from '../../../utilities/basic-functions';

// A profile in a directory's browse grid — the same card as
// Engineering's, with the pillar's trades / specialties and a portfolio
// count instead of services. `dir` is an entry of ../config.js.
function ProfileCard({ profile, dir }) {
	const place = [profile.city, countryName(profile.country)]
		.filter(Boolean)
		.join(', ');
	const projects = profile.portfolio?.length || 0;
	const values = profile[dir.field] || [];

	return (
		<CardShell>
			<div className="flex items-start gap-4">
				<ProfileAvatar
					avatar={profile.avatar}
					name={profile.headline}
					size={56}
				/>
				<div className="min-w-0 flex-1">
					<h3 className="sc_headline">
						<Link to={dir.path(profile)} className="sc_link">
							{profile.headline}
						</Link>
						{profile.isVerified && (
							<LuBadgeCheck
								className="ml-1.5 inline align-[-2px] text-[18px] text-(--pg-status-success)"
								aria-label="Verified"
							/>
						)}
					</h3>
					<div className="sc_meta mt-2">
						{place && (
							<span className="inline-flex items-center gap-1.5">
								<LuMapPin aria-hidden="true" /> {place}
							</span>
						)}
						{profile.yearsOfExperience != null && (
							<span className="inline-flex items-center gap-1.5">
								<LuBriefcase aria-hidden="true" /> {profile.yearsOfExperience}{' '}
								yrs
							</span>
						)}
					</div>
				</div>
			</div>

			<RatingStars value={profile.ratingAverage} count={profile.ratingCount} />

			{profile.bio && <p className="sc_bio">{profile.bio}</p>}

			<div className="flex flex-wrap gap-2">
				{values.slice(0, 4).map((value) => (
					<Chip key={value}>{dir.valueLabel(value)}</Chip>
				))}
				{values.length > 4 && <Chip>+{values.length - 4}</Chip>}
			</div>

			<div className="sc_footer">
				<span className="sc_price inline-flex items-center gap-1.5">
					<LuImages aria-hidden="true" />
					{projects
						? `${projects} past project${projects === 1 ? '' : 's'}`
						: 'No projects listed yet'}
				</span>
				<span
					className="sc_cta inline-flex items-center gap-1.5"
					aria-hidden="true"
				>
					View profile <LuArrowRight />
				</span>
			</div>
		</CardShell>
	);
}

ProfileCard.propTypes = {
	profile: PropTypes.object.isRequired,
	dir: PropTypes.object.isRequired,
};

export default ProfileCard;
