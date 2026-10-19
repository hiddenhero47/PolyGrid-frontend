import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
	LuBadgeCheck,
	LuMapPin,
	LuBriefcase,
	LuArrowRight,
} from 'react-icons/lu';
import ProfileAvatar from '../../../components/profile-avatar';
import RatingStars from '../../../components/rating-stars';
import { Chip } from '../../home/elements/index.style';
import {
	SPECIALIZATION_LABELS,
	PRICING_MODE_LABELS,
} from '../../../utilities/app-const';
import { countryName, formatMoney } from '../../../utilities/basic-functions';
import { consultantPath } from '../../../utilities/app-routes';
import { ConsultantCardShell } from './index.style';

// The cheapest listed service, for a "from $X" line
const startingPrice = (services = []) => {
	const priced = services.filter((s) => typeof s.price === 'number');
	if (!priced.length) return null;
	return priced.reduce((min, s) => (s.price < min.price ? s : min));
};

function ConsultantCard({ profile }) {
	const from = startingPrice(profile.services);
	const place = [profile.city, countryName(profile.country)]
		.filter(Boolean)
		.join(', ');

	return (
		<ConsultantCardShell>
			<div className="flex items-start gap-4">
				<ProfileAvatar
					avatar={profile.avatar}
					name={profile.headline}
					size={56}
				/>
				<div className="min-w-0 flex-1">
					<h3 className="sc_headline">
						<Link to={consultantPath(profile)} className="sc_link">
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
				{profile.specializations?.map((s) => (
					<Chip key={s}>{SPECIALIZATION_LABELS[s] || s}</Chip>
				))}
				{profile.mentorship?.isMentor && <Chip $accent>Mentor</Chip>}
			</div>

			<div className="sc_footer">
				<span className="sc_price">
					{from ? (
						<>
							From <strong>{formatMoney(from.price, from.currency)}</strong>
							{from.pricingMode !== 'fixed' &&
								` ${PRICING_MODE_LABELS[from.pricingMode]}`}
						</>
					) : (
						'Pricing on request'
					)}
				</span>
				<span
					className="sc_cta inline-flex items-center gap-1.5"
					aria-hidden="true"
				>
					View profile <LuArrowRight />
				</span>
			</div>
		</ConsultantCardShell>
	);
}

ConsultantCard.propTypes = {
	profile: PropTypes.shape({
		id: PropTypes.string,
		slug: PropTypes.string,
		headline: PropTypes.string,
		bio: PropTypes.string,
		avatar: PropTypes.object,
		isVerified: PropTypes.bool,
		country: PropTypes.string,
		city: PropTypes.string,
		yearsOfExperience: PropTypes.number,
		specializations: PropTypes.arrayOf(PropTypes.string),
		services: PropTypes.array,
		mentorship: PropTypes.object,
		ratingAverage: PropTypes.number,
		ratingCount: PropTypes.number,
	}).isRequired,
};

export default ConsultantCard;
