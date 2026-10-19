import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { initials } from '../../utilities/basic-functions';

// A profile picture: whatever `avatar.url` the backend sent, else the
// initials (frontend-plan §2 — never a separate empty state per pillar).

const Frame = styled.span`
	position: relative;
	display: inline-flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	width: ${({ $size }) => $size}px;
	height: ${({ $size }) => $size}px;
	overflow: hidden;
	border-radius: ${({ $size }) => Math.round($size * 0.26)}px;
	border: 1px solid ${({ theme }) => theme.icon.accentBorder};
	background-color: ${({ theme }) => theme.icon.accentBackground};
	color: ${({ theme }) => theme.icon.accentColor};
	font-family: var(--font-display);
	font-size: ${({ $size }) => Math.round($size * 0.38)}px;
	font-weight: 600;

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

function ProfileAvatar({ avatar, name = '', size = 56 }) {
	return (
		<Frame $size={size}>
			{avatar?.url ? (
				<img src={avatar.url} alt="" loading="lazy" />
			) : (
				<span aria-hidden="true">{initials(name) || 'PG'}</span>
			)}
		</Frame>
	);
}

ProfileAvatar.propTypes = {
	avatar: PropTypes.shape({ url: PropTypes.string }),
	name: PropTypes.string,
	size: PropTypes.number,
};

export default ProfileAvatar;
