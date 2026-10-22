import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
	LuPlus,
	LuFileText,
	LuCloudOff,
	LuRotateCw,
	LuFiles,
} from 'react-icons/lu';
import ProductServices from '../../../../../../features/services/custom-hooks/products';
import EmptyState from '../../../../../../components/empty-state';
import StatusBadge from '../../../../../../components/status-badge';
import Pagination from '../../../../../../components/pagination';
import { AppButton } from '../../../../../../components/button';
import { DIGITAL_PRODUCT_CATEGORY_LABELS } from '../../../../../../utilities/app-const';
import {
	formatMoney,
	humanize,
} from '../../../../../../utilities/basic-functions';
import DigitalProductModal from './digital-product-modal';
import { ProductRow } from './index.style';

// A creator's files (GET /api/digital-creator-profiles/me/products —
// every one, approved or not). A file shows in the public feed only when
// our team has approved it, it's on sale, and the creator is verified
// and subscribed.
function DigitalProductsTab() {
	const modalRef = useRef(null);
	const [page, setPage] = useState(1);
	const [openId, setOpenId] = useState(null);
	const { data, isPending, isError, refetch } =
		ProductServices.myDigitalProducts({ page });
	const items = data?.data || [];
	const open = items.find((p) => p.id === openId) || null;

	const show = (id = null) => {
		setOpenId(id);
		modalRef.current.open();
	};

	return (
		<>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[15px] text-(--pg-text-secondary)">
					{data
						? `${data.pagination.total} file${data.pagination.total === 1 ? '' : 's'}`
						: 'Files'}{' '}
					· new files are reviewed by our team before they go on sale.
				</p>
				<AppButton size="sm" icon={<LuPlus />} onClick={() => show()}>
					Sell a file
				</AppButton>
			</div>

			{isError ? (
				<EmptyState
					compact
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load your files"
					actions={
						<AppButton
							size="sm"
							icon={<LuRotateCw />}
							onClick={() => refetch()}
						>
							Retry
						</AppButton>
					}
				/>
			) : !isPending && items.length === 0 ? (
				<EmptyState
					compact
					tone="accent"
					icon={<LuFiles />}
					title="Nothing for sale yet"
					text="Upload a drawing set, template or calculation sheet — with preview images buyers can see first."
				/>
			) : (
				<ul className="flex flex-col gap-3">
					{items.map((product) => (
						<li key={product.id}>
							<ProductRow type="button" onClick={() => show(product.id)}>
								<span className="sc_thumb" aria-hidden="true">
									{product.previewImages?.[0] ? (
										<img
											src={product.previewImages[0].url}
											alt=""
											loading="lazy"
										/>
									) : (
										<LuFileText />
									)}
								</span>
								<span className="min-w-0 flex-1">
									<span className="sc_title">{product.title}</span>
									<span className="sc_meta">
										{DIGITAL_PRODUCT_CATEGORY_LABELS[product.category] ||
											humanize(product.category)}{' '}
										· {product.files?.length || 0} file
										{product.files?.length === 1 ? '' : 's'}
									</span>
									<span className="mt-2 flex flex-wrap gap-2">
										<StatusBadge
											label={
												product.isVerified ? 'Approved' : 'Awaiting review'
											}
											tone={product.isVerified ? 'success' : 'warning'}
										/>
										{!product.isActive && (
											<StatusBadge label="Not on sale" tone="neutral" />
										)}
									</span>
								</span>
								<span className="sc_price">
									{product.price === 0
										? 'Free'
										: formatMoney(product.price, product.currency)}
								</span>
							</ProductRow>
						</li>
					))}
				</ul>
			)}

			{data?.pagination?.totalPages > 1 && (
				<div className="mt-5">
					<Pagination pagination={data.pagination} changePage={setPage} />
				</div>
			)}

			<DigitalProductModal
				refName={modalRef}
				product={open}
				onClose={() => setOpenId(null)}
			/>
		</>
	);
}

DigitalProductsTab.propTypes = {
	profile: PropTypes.object,
};

export default DigitalProductsTab;
