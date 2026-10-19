import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { LuEyeOff, LuArrowLeft } from 'react-icons/lu';
import { AppButton } from '../button';
import EmptyState from './index';

// frontend-plan §2: a profile / product / listing page whose URL resolves
// but the backend answers 200 { available: false, message } — banned,
// unverified, or not currently subscribed. Deliberately NOT the 404 page:
// the thing exists, it's just not showable right now.
//   if (data?.available === false) return <UnavailableState message={data.message} browseTo={…} />
function UnavailableState({
	message,
	browseTo,
	browseLabel = 'Browse others',
}) {
	const navigate = useNavigate();
	return (
		<EmptyState
			icon={<LuEyeOff />}
			eyebrow="Unavailable"
			title="Not available right now"
			text={
				message ||
				'This page exists, but it isn’t visible at the moment. It may be updating its details or taking a break — check back later.'
			}
			actions={
				<>
					<AppButton
						variant="secondary"
						icon={<LuArrowLeft />}
						onClick={() => navigate(-1)}
					>
						Go back
					</AppButton>
					{browseTo && <AppButton to={browseTo}>{browseLabel}</AppButton>}
				</>
			}
		/>
	);
}

UnavailableState.propTypes = {
	message: PropTypes.string,
	browseTo: PropTypes.string,
	browseLabel: PropTypes.string,
};

export default UnavailableState;
