import React from 'react';
import PropTypes from 'prop-types';
import { LuPanelLeftClose, LuPanelLeftOpen, LuArrowLeft } from 'react-icons/lu';
import AppLogo from '../../../components/logo';
import { ROUTES } from '../../../utilities/app-routes';
import { NavShell, NavItemLink, NavItemSoon, IconButton } from '../index.style';

// A dashboard menu (admin or user) — rendered in the desktop side card
// and, on smaller screens, inside a Modal.Left drawer (`onNavigate`
// closes it). `sections` = [{ heading, items: [{ label, to, icon, end?,
// countKey?, soon? }] }]; `counts` fills an item's countKey badge.
function SidebarNav({
	sections = [],
	consoleLabel,
	counts = {},
	collapsed = false,
	onToggleCollapse,
	onNavigate,
}) {
	return (
		<NavShell $collapsed={collapsed} aria-label={consoleLabel || 'Dashboard'}>
			<div className="sc_brand">
				{!collapsed && (
					<div>
						<AppLogo size={28} textSize="text-[19px]" />
						{consoleLabel && <span className="sc_console">{consoleLabel}</span>}
					</div>
				)}
				{onToggleCollapse && (
					<IconButton
						type="button"
						onClick={onToggleCollapse}
						aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
						title={collapsed ? 'Expand menu' : 'Collapse menu'}
					>
						{collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
					</IconButton>
				)}
			</div>

			<div className="sc_sections">
				{sections.map((section) => (
					<div key={section.heading} className="sc_section">
						<h3 className="sc_heading">{section.heading}</h3>
						<ul className="flex flex-col gap-1">
							{section.items.map(({ icon: Icon, ...item }) => {
								const count = item.countKey ? counts[item.countKey] : 0;
								const content = (
									<>
										<Icon className="sc_navIcon" aria-hidden="true" />
										<span className="sc_label">{item.label}</span>
										{item.soon && <span className="sc_soon">Soon</span>}
										{count > 0 && (
											<span
												className="sc_count"
												aria-label={`${count} waiting`}
											>
												{count > 99 ? '99+' : count}
											</span>
										)}
									</>
								);
								return (
									<li key={item.label}>
										{item.soon ? (
											<NavItemSoon
												$collapsed={collapsed}
												title={`${item.label} — coming soon`}
												aria-disabled="true"
											>
												{content}
											</NavItemSoon>
										) : (
											<NavItemLink
												to={item.to}
												end={item.end}
												$collapsed={collapsed}
												title={collapsed ? item.label : undefined}
												onClick={onNavigate}
											>
												{content}
											</NavItemLink>
										)}
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</div>

			<div className="sc_footer">
				<NavItemLink
					to={ROUTES.HOME}
					end
					$collapsed={collapsed}
					title={collapsed ? 'Back to site' : undefined}
				>
					<LuArrowLeft className="sc_navIcon" aria-hidden="true" />
					<span className="sc_label">Back to site</span>
				</NavItemLink>
			</div>
		</NavShell>
	);
}

SidebarNav.propTypes = {
	sections: PropTypes.array,
	consoleLabel: PropTypes.string,
	counts: PropTypes.object,
	collapsed: PropTypes.bool,
	onToggleCollapse: PropTypes.func,
	onNavigate: PropTypes.func,
};

export default SidebarNav;
