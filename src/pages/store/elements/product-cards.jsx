import React from 'react';
import PropTypes from 'prop-types';
import { LuPackage, LuFileText } from 'react-icons/lu';
import ProfileAvatar from '../../../components/profile-avatar';
import {
	MATERIAL_CATEGORY_LABELS,
	DIGITAL_PRODUCT_CATEGORY_LABELS,
} from '../../../utilities/app-const';
import { formatMoney, humanize } from '../../../utilities/basic-functions';
import { productPath, digitalProductPath } from '../../../utilities/app-routes';
import { ProductTile } from './index.style';

const STOCK_NOTE = {
	out_of_stock: 'Out of stock',
	made_to_order: 'Made to order',
};

// A physical product in a store catalog / store card.
export function ProductCard({ product, compact = false }) {
	const image = product.images?.[0];
	return (
		<ProductTile
			to={productPath(product)}
			$ratio={compact ? '1 / 1' : undefined}
		>
			<span className="sc_media" aria-hidden="true">
				{image ? <img src={image.url} alt="" loading="lazy" /> : <LuPackage />}
				{STOCK_NOTE[product.stockStatus] && !compact && (
					<span className="sc_tag">{STOCK_NOTE[product.stockStatus]}</span>
				)}
			</span>
			<span className="sc_body">
				<span className="sc_title">{product.title}</span>
				{!compact && (
					<span className="sc_meta">
						{product.subCategory ||
							MATERIAL_CATEGORY_LABELS[product.category] ||
							humanize(product.category)}
					</span>
				)}
				<span className="sc_price">
					{formatMoney(product.price, product.currency)}
					<small>/ {product.unit}</small>
				</span>
			</span>
		</ProductTile>
	);
}

ProductCard.propTypes = {
	product: PropTypes.object.isRequired,
	compact: PropTypes.bool,
};

// A digital file in the feed / a creator's page; `creator` shows who made it.
export function DigitalCard({ product, creator }) {
	const image = product.previewImages?.[0];
	return (
		<ProductTile to={digitalProductPath(product)}>
			<span className="sc_media" aria-hidden="true">
				{image ? <img src={image.url} alt="" loading="lazy" /> : <LuFileText />}
				<span className="sc_tag">
					{DIGITAL_PRODUCT_CATEGORY_LABELS[product.category] ||
						humanize(product.category)}
				</span>
			</span>
			<span className="sc_body">
				<span className="sc_title">{product.title}</span>
				{creator && (
					<span className="sc_meta inline-flex items-center gap-2">
						<ProfileAvatar
							avatar={creator.avatar}
							name={creator.displayName}
							size={22}
						/>
						{creator.displayName}
					</span>
				)}
				<span className="sc_price">
					{product.price === 0
						? 'Free'
						: formatMoney(product.price, product.currency)}
				</span>
			</span>
		</ProductTile>
	);
}

DigitalCard.propTypes = {
	product: PropTypes.object.isRequired,
	creator: PropTypes.object,
};
