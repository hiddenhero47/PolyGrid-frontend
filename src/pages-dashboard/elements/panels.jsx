import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { LuArrowLeft, LuFileText, LuX } from 'react-icons/lu';

// Small building blocks shared by the Phase 3 dashboard pages (jobs,
// tenders, SiteForce, orders): a titled panel, the "← All …" link, a
// listing card for board / "mine" lists, and a files list.

export const eyebrowClass =
	'font-label text-xs font-semibold tracking-[0.16em] text-(--pg-text-secondary) uppercase';

export function Panel({ title, icon, action, children, className = '' }) {
	return (
		<section
			className={`rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-5 ${className}`}
		>
			{(title || action) && (
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
					<h2 className={`${eyebrowClass} inline-flex items-center gap-2`}>
						{icon} {title}
					</h2>
					{action}
				</div>
			)}
			{children}
		</section>
	);
}

Panel.propTypes = {
	title: PropTypes.node,
	icon: PropTypes.node,
	action: PropTypes.node,
	children: PropTypes.node,
	className: PropTypes.string,
};

export function BackLink({ to, children }) {
	return (
		<Link
			to={to}
			className="font-label mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
		>
			<LuArrowLeft aria-hidden="true" /> {children}
		</Link>
	);
}

BackLink.propTypes = {
	to: PropTypes.string.isRequired,
	children: PropTypes.node,
};

// One row of a board / "my …" list: title + chips, a line of facts,
// optional note, and an aside (amount, status badge).
export function ListingCard({ to, title, chips, facts = [], note, aside }) {
	return (
		<Link
			to={to}
			className="flex flex-wrap items-center gap-4 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-4 transition-colors hover:border-(--pg-card-borderHover) md:flex-nowrap"
		>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="truncate text-[15.5px] font-semibold text-(--pg-text-primary)">
						{title}
					</span>
					{chips}
				</div>
				{facts.filter(Boolean).length > 0 && (
					<p className="mt-1 text-sm text-(--pg-text-secondary)">
						{facts.filter(Boolean).join(' · ')}
					</p>
				)}
				{note}
			</div>
			{aside && (
				<div className="flex flex-wrap items-center gap-3">{aside}</div>
			)}
		</Link>
	);
}

ListingCard.propTypes = {
	to: PropTypes.string.isRequired,
	title: PropTypes.node.isRequired,
	chips: PropTypes.node,
	facts: PropTypes.array,
	note: PropTypes.node,
	aside: PropTypes.node,
};

const kb = (size) =>
	size >= 1024 * 1024
		? `${(size / 1024 / 1024).toFixed(1)} MB`
		: `${Math.max(1, Math.round(size / 1024))} KB`;

// Attached files with their signed `url`s; `onRemove` adds a remove
// button per file.
export function FileList({ files = [], onRemove, removing }) {
	if (!files.length)
		return (
			<p className="text-sm text-(--pg-text-secondary)">No files attached.</p>
		);
	return (
		<ul className="flex flex-col gap-2">
			{files.map((file) => (
				<li
					key={file.fileName}
					className="flex items-center gap-3 rounded-xl border border-(--pg-card-border) px-3 py-2.5 text-sm"
				>
					<LuFileText
						aria-hidden="true"
						className="shrink-0 text-(--pg-text-secondary)"
					/>
					{file.url ? (
						<a
							href={file.url}
							target="_blank"
							rel="noreferrer"
							className="min-w-0 flex-1 truncate text-(--pg-text-primary) hover:underline"
						>
							{file.fileName}
						</a>
					) : (
						<span className="min-w-0 flex-1 truncate text-(--pg-text-primary)">
							{file.fileName}
						</span>
					)}
					{file.size > 0 && (
						<span className="shrink-0 text-xs text-(--pg-text-secondary)">
							{kb(file.size)}
						</span>
					)}
					{onRemove && (
						<button
							type="button"
							onClick={() => onRemove(file)}
							disabled={removing}
							aria-label={`Remove ${file.fileName}`}
							className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-status-error) disabled:opacity-40"
						>
							<LuX aria-hidden="true" />
						</button>
					)}
				</li>
			))}
		</ul>
	);
}

FileList.propTypes = {
	files: PropTypes.array,
	onRemove: PropTypes.func,
	removing: PropTypes.bool,
};

// A label + value fact in a detail sidebar.
export function Fact({ label, children }) {
	return (
		<div>
			<dt className="text-xs text-(--pg-text-secondary)">{label}</dt>
			<dd className="mt-0.5 text-sm font-semibold text-(--pg-text-primary)">
				{children}
			</dd>
		</div>
	);
}

Fact.propTypes = { label: PropTypes.node.isRequired, children: PropTypes.node };
