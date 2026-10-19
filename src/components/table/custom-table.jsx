import React from 'react';
import PropTypes from 'prop-types';
import { LuInbox, LuTriangleAlert, LuRotateCw, LuPlus } from 'react-icons/lu';
import { AppButton } from '../button';
import Pagination from '../pagination';
import {
	TableFrame,
	TableScroll,
	SkeletonBar,
	TableMessage,
} from './index.style';

// HM's CustomTable, same API:
//   fields={[{ Header: () => 'Status', accessor: 'status',
//              Cell: ({ value, row, nos }) => … }]}
// plus, new here:
//   - skeleton rows while loading, and an error state (isError + refetch)
//   - pagination={data.pagination} — the backend's { total, page, limit,
//     totalPages } — instead of (or alongside) HM's currentPage/totalPages
//   - clickable rows are keyboard reachable (Tab + Enter)
//   - field.align ('left' | 'right' | 'center'), field.width
//   - sticky header; `nos` counts across pages

const SKELETON_WIDTHS = ['55%', '80%', '40%', '70%', '60%'];

const renderHeader = (Header) =>
	typeof Header === 'function' ? <Header /> : Header;

function CustomTable({
	isLoading = false,
	isError = false,
	dataSource = [],
	fields = [],
	onCallRow,
	onDoubleCallRow,
	rowKey = '_id',
	currentPage,
	changePage,
	totalPages,
	pagination,
	showPagination = true,
	paddingHeaderX = '12px',
	paddingHeaderY = '13px',
	paddingCellX = '12px',
	paddingCellY = '14px',
	headerBg = true,
	bodyBg = true,
	useStrip = false,
	stickyHeader = true,
	maxHeight,
	loadingRows = 5,
	emptyIcon,
	emptyText = 'Nothing here yet',
	emptySbText,
	errorText = 'Couldn’t load this list',
	errorSbText = 'Check your connection and try again.',
	refetch,
	addData,
	addLabel = 'Add',
	ariaLabel,
}) {
	const clickable = Boolean(onCallRow || onDoubleCallRow);
	const page = Number(pagination?.page ?? currentPage ?? 1);
	const limit = Number(pagination?.limit ?? dataSource.length ?? 0);
	const offset = (page - 1) * limit;

	const hasRows = !isLoading && !isError && dataSource.length > 0;
	const isEmpty = !isLoading && !isError && dataSource.length === 0;

	const alignClass = (field) =>
		field.align && field.align !== 'left'
			? `sc_align_${field.align}`
			: undefined;

	const handleRowKey = (e, item) => {
		if (e.key === 'Enter') onCallRow?.(item);
	};

	return (
		<TableFrame>
			<TableScroll
				$maxHeight={maxHeight}
				$padHeadX={paddingHeaderX}
				$padHeadY={paddingHeaderY}
				$padCellX={paddingCellX}
				$padCellY={paddingCellY}
				$headerBg={headerBg}
				$bodyBg={bodyBg}
				$useStrip={useStrip}
				$sticky={stickyHeader}
				className="Y_scroll_style scroll_style"
			>
				<table aria-label={ariaLabel} aria-busy={isLoading || undefined}>
					<thead>
						<tr>
							{fields.map((field, index) => (
								<th
									key={field.accessor ?? index}
									scope="col"
									className={alignClass(field)}
									style={field.width ? { width: field.width } : undefined}
								>
									{renderHeader(field.Header)}
								</th>
							))}
						</tr>
					</thead>

					<tbody>
						{isLoading &&
							Array.from({ length: loadingRows }, (_, r) => (
								<tr key={`loading-${r}`}>
									{fields.map((field, c) => (
										<td key={field.accessor ?? c}>
											<SkeletonBar
												$width={
													SKELETON_WIDTHS[(r + c) % SKELETON_WIDTHS.length]
												}
											/>
										</td>
									))}
								</tr>
							))}

						{hasRows &&
							dataSource.map((item, index) => (
								<tr
									key={item?.[rowKey] ?? index}
									className={clickable ? 'sc_clickable' : undefined}
									onClick={onCallRow ? () => onCallRow(item) : undefined}
									onDoubleClick={
										onDoubleCallRow ? () => onDoubleCallRow(item) : undefined
									}
									onKeyDown={
										onCallRow ? (e) => handleRowKey(e, item) : undefined
									}
									tabIndex={clickable ? 0 : undefined}
								>
									{fields.map((field, c) => (
										<td key={field.accessor ?? c} className={alignClass(field)}>
											{field.Cell
												? field.Cell({
														value: item?.[field.accessor],
														row: { original: item },
														nos: offset + index + 1,
													})
												: item?.[field.accessor]}
										</td>
									))}
								</tr>
							))}
					</tbody>
				</table>

				{(isEmpty || isError) && (
					<TableMessage $error={isError} role={isError ? 'alert' : undefined}>
						<span className="sc_icon" aria-hidden="true">
							{isError ? <LuTriangleAlert /> : emptyIcon || <LuInbox />}
						</span>
						<p className="sc_title">{isError ? errorText : emptyText}</p>
						{(isError ? errorSbText : emptySbText) && (
							<p className="sc_text">{isError ? errorSbText : emptySbText}</p>
						)}
						{(refetch || (addData && !isError)) && (
							<div className="sc_actions">
								{refetch && (
									<AppButton
										size="sm"
										variant="secondary"
										icon={<LuRotateCw />}
										onClick={() => refetch()}
									>
										Retry
									</AppButton>
								)}
								{addData && !isError && (
									<AppButton
										size="sm"
										icon={<LuPlus />}
										onClick={() => addData()}
									>
										{addLabel}
									</AppButton>
								)}
							</div>
						)}
					</TableMessage>
				)}
			</TableScroll>

			{showPagination && changePage && !isError && (
				<Pagination
					pagination={pagination}
					currentPage={currentPage}
					totalPages={totalPages}
					changePage={changePage}
				/>
			)}
		</TableFrame>
	);
}

CustomTable.propTypes = {
	isLoading: PropTypes.bool,
	isError: PropTypes.bool,
	dataSource: PropTypes.array,
	fields: PropTypes.arrayOf(
		PropTypes.shape({
			Header: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
			accessor: PropTypes.string,
			Cell: PropTypes.func,
			align: PropTypes.oneOf(['left', 'right', 'center']),
			width: PropTypes.string,
		})
	),
	onCallRow: PropTypes.func,
	onDoubleCallRow: PropTypes.func,
	rowKey: PropTypes.string,
	currentPage: PropTypes.number,
	changePage: PropTypes.func,
	totalPages: PropTypes.number,
	pagination: PropTypes.shape({
		total: PropTypes.number,
		page: PropTypes.number,
		limit: PropTypes.number,
		totalPages: PropTypes.number,
	}),
	showPagination: PropTypes.bool,
	paddingHeaderX: PropTypes.string,
	paddingHeaderY: PropTypes.string,
	paddingCellX: PropTypes.string,
	paddingCellY: PropTypes.string,
	headerBg: PropTypes.bool,
	bodyBg: PropTypes.bool,
	useStrip: PropTypes.bool,
	stickyHeader: PropTypes.bool,
	maxHeight: PropTypes.string,
	loadingRows: PropTypes.number,
	emptyIcon: PropTypes.node,
	emptyText: PropTypes.node,
	emptySbText: PropTypes.node,
	errorText: PropTypes.node,
	errorSbText: PropTypes.node,
	refetch: PropTypes.func,
	addData: PropTypes.func,
	addLabel: PropTypes.string,
	ariaLabel: PropTypes.string,
};

export default CustomTable;
