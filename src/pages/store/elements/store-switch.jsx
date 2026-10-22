import React from 'react';
import { NavLink } from 'react-router-dom';
import { LuPackage, LuFileText } from 'react-icons/lu';
import { ROUTES } from '../../../utilities/app-routes';

// PolyGrid Store's two halves — the materials marketplace (store-first)
// and the digital-files feed — as two links styled like segmented tabs.
function StoreSwitch() {
	const link = ({ isActive }) =>
		`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors ${
			isActive
				? 'bg-(--pg-tab-activeBg) text-(--pg-tab-activeText)'
				: 'text-(--pg-text-secondary) hover:text-(--pg-text-primary)'
		}`;
	return (
		<nav
			aria-label="Store sections"
			className="inline-flex gap-1 rounded-[14px] border border-(--pg-border-default) bg-(--pg-surface-background) p-1"
		>
			<NavLink to={ROUTES.STORE} end className={link}>
				<LuPackage aria-hidden="true" /> Materials
			</NavLink>
			<NavLink to={ROUTES.DIGITAL_STORE} end className={link}>
				<LuFileText aria-hidden="true" /> Digital files
			</NavLink>
		</nav>
	);
}

export default StoreSwitch;
