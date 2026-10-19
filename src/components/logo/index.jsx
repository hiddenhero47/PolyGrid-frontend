import React from 'react';
import PropTypes from 'prop-types';
import LogoMark from '../../assets/brand/logo-mark.svg?react';

// The PolyGrid mark (docs/assets/brand/logo-concept-a.svg), colored by the
// theme's logo.base / logo.accent tokens, with an optional wordmark.
function AppLogo({
	size = 30,
	textSize = 'text-xl',
	withWordmark = true,
	className = '',
}) {
	return (
		<span className={`inline-flex items-center gap-2.5 ${className}`}>
			<LogoMark
				width={size}
				height={size}
				aria-hidden="true"
				className="shrink-0"
			/>
			{withWordmark && (
				<span
					className={`font-display ${textSize} leading-none font-semibold tracking-[0.06em] text-(--pg-text-primary) uppercase`}
				>
					Poly<span className="text-(--pg-logo-accent)">Grid</span>
				</span>
			)}
		</span>
	);
}

AppLogo.propTypes = {
	size: PropTypes.number,
	textSize: PropTypes.string, // Tailwind text size for the wordmark
	withWordmark: PropTypes.bool,
	className: PropTypes.string,
};

export default AppLogo;
