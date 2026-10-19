import React from 'react';
import PropTypes from 'prop-types';
import { EmptyWrapper } from './index.style';

// One panel for "nothing here", "not available", "something went wrong":
// icon, optional eyebrow, title, text, actions. Pages pick the copy; the
// look stays the same everywhere.
function EmptyState({
	icon,
	eyebrow,
	title,
	text,
	actions,
	tone = 'neutral',
	compact = false,
	role,
	className,
}) {
	return (
		<EmptyWrapper
			$tone={tone}
			$compact={compact}
			role={role}
			className={className}
		>
			{icon && (
				<span className="sc_icon" aria-hidden="true">
					{icon}
				</span>
			)}
			{eyebrow && <p className="sc_eyebrow">{eyebrow}</p>}
			{title && <h2 className="sc_title">{title}</h2>}
			{text && <p className="sc_text">{text}</p>}
			{actions && <div className="sc_actions">{actions}</div>}
		</EmptyWrapper>
	);
}

EmptyState.propTypes = {
	icon: PropTypes.node,
	eyebrow: PropTypes.node,
	title: PropTypes.node,
	text: PropTypes.node,
	actions: PropTypes.node,
	tone: PropTypes.oneOf(['neutral', 'accent', 'success', 'error']),
	compact: PropTypes.bool,
	role: PropTypes.string,
	className: PropTypes.string,
};

export default EmptyState;
