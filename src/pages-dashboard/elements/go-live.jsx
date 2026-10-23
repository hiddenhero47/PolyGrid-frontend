import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
	LuCircleCheck,
	LuCircleDashed,
	LuClock,
	LuCircleX,
	LuArrowRight,
} from 'react-icons/lu';
import { ROUTES } from '../../utilities/app-routes';
import { GoLiveStrip } from './index.style';
import { useGoLiveState } from './go-live-state';

const ICONS = {
	done: LuCircleCheck,
	waiting: LuClock,
	failed: LuCircleX,
	todo: LuCircleDashed,
};

// "Go live" checklist (Stitch editor screen): the three things a profile
// needs before it appears in public search, each linking to where it's
// fixed.
function GoLive({ profileType, profile, editTo, liveText }) {
	const state = useGoLiveState(profileType, profile);
	const verifyTo = `${ROUTES.DASHBOARD_VERIFICATION}?profileType=${profileType}`;

	const steps = [
		{
			key: 'details',
			label: 'Profile details',
			status: 'done',
			note: 'Created',
			to: editTo,
		},
		{
			key: 'verification',
			label: 'Verification',
			status: state.verification,
			note: {
				done: 'Approved',
				waiting: 'Under review',
				failed: 'Rejected — resubmit',
				todo: 'Not submitted',
			}[state.verification],
			to: verifyTo,
		},
		{
			key: 'subscription',
			label: 'Subscription',
			status: state.subscribed ? 'done' : 'todo',
			note: state.subscribed ? 'Active plan' : 'No active plan',
			to: ROUTES.DASHBOARD_SUBSCRIPTION,
		},
		{
			key: 'status',
			label: 'Taking work',
			status: state.active ? 'done' : 'todo',
			note: state.active ? 'Active' : 'On a break',
			to: editTo,
		},
	];

	return (
		<GoLiveStrip aria-label="Go-live checklist">
			<div className="sc_head">
				<span className="sc_title">
					{state.live ? 'Live on PolyGrid' : 'Go-live checklist'}
				</span>
				<span className="sc_sub">
					{state.live
						? liveText?.on || 'This profile shows in public search.'
						: liveText?.off ||
							'All four are needed before this profile shows in public search.'}
				</span>
			</div>
			<ol className="sc_steps">
				{steps.map(({ key, label, status, note, to }) => {
					const Icon = ICONS[status];
					return (
						<li key={key}>
							<Link to={to} className="sc_step" data-status={status}>
								<Icon className="sc_stepIcon" aria-hidden="true" />
								<span className="min-w-0">
									<span className="sc_stepLabel">{label}</span>
									<span className="sc_stepNote">{note}</span>
								</span>
								{status !== 'done' && (
									<LuArrowRight className="sc_go" aria-hidden="true" />
								)}
							</Link>
						</li>
					);
				})}
			</ol>
		</GoLiveStrip>
	);
}

GoLive.propTypes = {
	profileType: PropTypes.string.isRequired,
	profile: PropTypes.object.isRequired,
	editTo: PropTypes.string,
	liveText: PropTypes.shape({ on: PropTypes.string, off: PropTypes.string }),
};

export default GoLive;
