import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { ButtonBase, ArrowLinkBase } from './index.style';

// `to` renders a router Link, `href` a plain anchor (in-page "#section"
// links, external URLs), neither a <button>.
const asProps = ({ to, href }) => {
	if (to) return { as: Link, to };
	if (href) return { as: 'a', href };
	return { type: 'button' };
};

export function AppButton({
	to,
	href,
	variant = 'primary',
	size = 'md',
	icon,
	children,
	className,
	...rest
}) {
	return (
		<ButtonBase
			{...asProps({ to, href })}
			$variant={variant}
			$size={size}
			className={className}
			{...rest}
		>
			{children}
			{icon && <span className="sc_btnIcon inline-flex">{icon}</span>}
		</ButtonBase>
	);
}

AppButton.propTypes = {
	to: PropTypes.string,
	href: PropTypes.string,
	variant: PropTypes.oneOf(['primary', 'secondary']),
	size: PropTypes.oneOf(['md', 'sm']),
	icon: PropTypes.node,
	children: PropTypes.node,
	className: PropTypes.string,
};

export function ArrowLink({ to, href, children, className }) {
	return (
		<ArrowLinkBase {...asProps({ to, href })} className={className}>
			{children}
			<LuArrowRight className="sc_btnIcon" aria-hidden="true" />
		</ArrowLinkBase>
	);
}

ArrowLink.propTypes = {
	to: PropTypes.string,
	href: PropTypes.string,
	children: PropTypes.node,
	className: PropTypes.string,
};
