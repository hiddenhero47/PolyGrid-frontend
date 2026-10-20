import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Outlet, useLocation } from 'react-router-dom';
import Modal from '../../components/modal/index_modal';
import ScrollToTop from '../scroll-to-top';
import SidebarNav from './sub-components/sidebar-nav';
import TopBar from './sub-components/top-bar';
import { ShellFrame, SideCard, MainColumn, PageCard } from './index.style';

const readFlag = (key) => {
	try {
		return localStorage.getItem(key) === 'true';
	} catch {
		return false;
	}
};

// The top bar's "where am I": the deepest menu item matching the path.
const titleForPath = (sections, pathname, fallback) => {
	const items = sections.flatMap((s) => s.items).filter((i) => i.to);
	const match = items
		.filter((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)))
		.sort((a, b) => b.to.length - a.to.length)[0];
	return match?.label || fallback;
};

// HM's dashboard shape, shared by the Admin Dashboard and the user's
// workspace: floating panels on the page background — a side menu card
// (collapsible on desktop, remembered under `collapseKey`; a Modal.Left
// drawer below 1024px), a top bar card and the page card (<Outlet />).
// Guards (who may enter) stay in the layouts that use this.
function DashboardShell({
	sections,
	counts,
	consoleLabel,
	eyebrow,
	roleLabel,
	collapseKey,
}) {
	const location = useLocation();
	const drawerRef = useRef(null);
	const [collapsed, setCollapsed] = useState(() => readFlag(collapseKey));

	const toggleCollapsed = () => {
		const next = !collapsed;
		setCollapsed(next);
		try {
			localStorage.setItem(collapseKey, String(next));
		} catch {
			// storage blocked — it just won't be remembered
		}
	};

	return (
		<ShellFrame>
			<ScrollToTop />
			<SideCard $collapsed={collapsed}>
				<SidebarNav
					sections={sections}
					consoleLabel={consoleLabel}
					counts={counts}
					collapsed={collapsed}
					onToggleCollapse={toggleCollapsed}
				/>
			</SideCard>

			<MainColumn>
				<TopBar
					eyebrow={eyebrow}
					roleLabel={roleLabel}
					title={titleForPath(sections, location.pathname, eyebrow)}
					onOpenMenu={() => drawerRef.current.open()}
				/>
				<PageCard>
					<Outlet />
				</PageCard>
			</MainColumn>

			{/* phones / tablets */}
			<Modal.Left
				refName={drawerRef}
				width="300px"
				queryWidth="86vw"
				ariaLabel={consoleLabel || 'Menu'}
			>
				<div className="flex h-full flex-col overflow-hidden rounded-r-[18px] border-r border-(--pg-sidebar-border) bg-(--pg-sidebar-background)">
					<SidebarNav
						sections={sections}
						consoleLabel={consoleLabel}
						counts={counts}
						onNavigate={() => drawerRef.current.close()}
					/>
				</div>
			</Modal.Left>
		</ShellFrame>
	);
}

DashboardShell.propTypes = {
	sections: PropTypes.array.isRequired,
	counts: PropTypes.object,
	consoleLabel: PropTypes.string,
	eyebrow: PropTypes.string,
	roleLabel: PropTypes.string,
	collapseKey: PropTypes.string.isRequired,
};

export default DashboardShell;
