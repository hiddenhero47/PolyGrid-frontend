import React from 'react';
import PropTypes from 'prop-types';
import { AuthHeading } from './index.style';

function AuthHeader({ eyebrow, title, subtitle }) {
	return (
		<AuthHeading>
			{eyebrow && <p className="sc_eyebrow">{eyebrow}</p>}
			<h1 className="sc_title">{title}</h1>
			{subtitle && <p className="sc_subtitle">{subtitle}</p>}
		</AuthHeading>
	);
}

AuthHeader.propTypes = {
	eyebrow: PropTypes.node,
	title: PropTypes.node.isRequired,
	subtitle: PropTypes.node,
};

export default AuthHeader;
