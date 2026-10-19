import React from 'react';
import PropTypes from 'prop-types';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { PaginationWrapper } from './index.style';

// The one pagination control (frontend-plan §2). Feed it HM's props
// (currentPage, changePage, totalPages) or the backend's object straight:
//   <Pagination pagination={data.pagination} changePage={setPage} />
// where pagination is { total, page, limit, totalPages }.

// 1 … 4 5 6 … 20 — always first, last, and one either side of current.
const pageList = (current, total) => {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const pages = [1];
	const start = Math.max(2, Math.min(current - 1, total - 4));
	const end = Math.min(total - 1, Math.max(current + 1, 5));
	if (start > 2) pages.push('gap-start');
	for (let p = start; p <= end; p += 1) pages.push(p);
	if (end < total - 1) pages.push('gap-end');
	pages.push(total);
	return pages;
};

function Pagination({
	currentPage,
	totalPages,
	changePage,
	pagination,
	showSummary = true,
	className,
}) {
	const page = Number(pagination?.page ?? currentPage ?? 1);
	const pages = Number(pagination?.totalPages ?? totalPages ?? 1);
	const total = pagination?.total;
	const limit = pagination?.limit;

	if (!changePage || pages < 1) return null;

	const go = (next) => {
		if (next >= 1 && next <= pages && next !== page) changePage(next);
	};

	const from = total ? (page - 1) * limit + 1 : null;
	const to = total ? Math.min(page * limit, total) : null;

	return (
		<PaginationWrapper aria-label="Pagination" className={className}>
			{showSummary && total != null && (
				<p className="sc_summary">
					{total === 0 ? (
						'No results'
					) : (
						<>
							Showing <strong>{from}</strong>–<strong>{to}</strong> of{' '}
							<strong>{total.toLocaleString()}</strong>
						</>
					)}
				</p>
			)}

			{pages > 1 && (
				<div className="sc_pages">
					<button
						type="button"
						className="sc_arrow"
						onClick={() => go(page - 1)}
						disabled={page <= 1}
						aria-label="Previous page"
					>
						<LuChevronLeft />
					</button>

					{pageList(page, pages).map((item) =>
						typeof item === 'string' ? (
							<span key={item} className="sc_gap" aria-hidden="true">
								…
							</span>
						) : (
							<button
								key={item}
								type="button"
								className="sc_page"
								onClick={() => go(item)}
								aria-current={item === page ? 'page' : undefined}
								aria-label={`Page ${item}`}
							>
								{item}
							</button>
						)
					)}

					<button
						type="button"
						className="sc_arrow"
						onClick={() => go(page + 1)}
						disabled={page >= pages}
						aria-label="Next page"
					>
						<LuChevronRight />
					</button>
				</div>
			)}
		</PaginationWrapper>
	);
}

Pagination.propTypes = {
	currentPage: PropTypes.number,
	totalPages: PropTypes.number,
	changePage: PropTypes.func,
	pagination: PropTypes.shape({
		total: PropTypes.number,
		page: PropTypes.number,
		limit: PropTypes.number,
		totalPages: PropTypes.number,
	}),
	showSummary: PropTypes.bool,
	className: PropTypes.string,
};

export default Pagination;
