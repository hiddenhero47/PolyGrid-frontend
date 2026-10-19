import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// frontend-plan §2: one badge, reused for every status enum. Pass the raw
// status and a map from status → { label, tone }; tones come from the
// theme's status tokens.
//   <StatusBadge status={job.status} map={JOB_STATUS_BADGES} />

const Badge = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 7px;
	padding: 4px 10px 4px 8px;
	border-radius: 999px;
	font-family: var(--font-label);
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	white-space: nowrap;
	background-color: ${({ theme, $tone }) => theme.status[`${$tone}Soft`]};
	color: ${({ theme, $tone }) => theme.status[$tone]};

	&::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: currentColor;
	}
`;

const TONES = ['success', 'warning', 'error', 'info', 'neutral', 'special'];

function StatusBadge({ status, map = {}, label, tone }) {
	const entry = map[status] || {};
	const resolvedTone = tone || entry.tone || 'neutral';
	const text = label || entry.label || String(status ?? '').replace(/_/g, ' ');
	return (
		<Badge $tone={TONES.includes(resolvedTone) ? resolvedTone : 'neutral'}>
			{text}
		</Badge>
	);
}

StatusBadge.propTypes = {
	status: PropTypes.string,
	map: PropTypes.objectOf(
		PropTypes.shape({ label: PropTypes.string, tone: PropTypes.oneOf(TONES) })
	),
	label: PropTypes.string,
	tone: PropTypes.oneOf(TONES),
};

export default StatusBadge;
