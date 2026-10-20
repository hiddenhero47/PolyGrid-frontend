import React from 'react';
import PropTypes from 'prop-types';

// The heading block at the top of every admin page: what this page is
// for, plus its main actions on the right.
function AdminPageHeader({ eyebrow, title, subtitle, actions }) {
	return (
		<div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
			<div className="min-w-0">
				{eyebrow && (
					<p className="font-label text-[11px] font-semibold tracking-[0.16em] text-(--pg-text-highlight) uppercase">
						{eyebrow}
					</p>
				)}
				<h2 className="font-display mt-1.5 text-[26px] leading-tight font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase md:text-[30px]">
					{title}
				</h2>
				{subtitle && (
					<p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-(--pg-text-secondary)">
						{subtitle}
					</p>
				)}
			</div>
			{actions && <div className="flex flex-wrap gap-3">{actions}</div>}
		</div>
	);
}

AdminPageHeader.propTypes = {
	eyebrow: PropTypes.node,
	title: PropTypes.node,
	subtitle: PropTypes.node,
	actions: PropTypes.node,
};

export default AdminPageHeader;
