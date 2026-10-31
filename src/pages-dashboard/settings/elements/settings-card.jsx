import React from 'react';
import PropTypes from 'prop-types';

// One settings section: what it is on the left (desktop), the controls on
// the right.
function SettingsCard({ id, title, description, children }) {
	return (
		<section
			aria-labelledby={id}
			className="grid gap-5 border-b border-(--pg-card-border) py-8 first:pt-0 last:border-b-0 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10"
		>
			<div>
				<h3
					id={id}
					className="font-display text-lg font-semibold tracking-[0.04em] text-(--pg-text-primary) uppercase"
				>
					{title}
				</h3>
				{description && (
					<p className="mt-1.5 text-[14.5px] leading-relaxed text-(--pg-text-secondary)">
						{description}
					</p>
				)}
			</div>
			<div className="min-w-0 max-w-160">{children}</div>
		</section>
	);
}

SettingsCard.propTypes = {
	id: PropTypes.string.isRequired,
	title: PropTypes.node.isRequired,
	description: PropTypes.node,
	children: PropTypes.node,
};

export default SettingsCard;
