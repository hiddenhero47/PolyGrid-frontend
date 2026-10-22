import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LuArrowLeft, LuLogIn, LuTruck } from 'react-icons/lu';
import StoreServices from '../../features/services/custom-hooks/store';
import ReferenceServices from '../../features/services/custom-hooks/reference';
import { selectIsAuthenticated } from '../../store/slice/auth';
import ProfileAvatar from '../../components/profile-avatar';
import StatusBadge from '../../components/status-badge';
import { AppButton } from '../../components/button';
import { Chip, Eyebrow } from '../home/elements/index.style';
import { ProfileSection } from '../engineering/profile/elements/index.style';
import { MATERIAL_CATEGORY_LABELS } from '../../utilities/app-const';
import {
	countryName,
	formatMoney,
	humanize,
} from '../../utilities/basic-functions';
import { ROUTES, storePath } from '../../utilities/app-routes';
import PublicPage from './elements/page-states';
import Gallery from './elements/gallery';

const STOCK = {
	in_stock: { label: 'In stock', tone: 'success' },
	out_of_stock: { label: 'Out of stock', tone: 'error' },
	made_to_order: { label: 'Made to order', tone: 'info' },
};

// "Lagos" from a state code, via the country's state list
function StateName({ country, code }) {
	const { data: states = [] } = ReferenceServices.getStates(country);
	return states.find((s) => s.isoCode === code)?.name || code;
}

StateName.propTypes = { country: PropTypes.string, code: PropTypes.string };

// frontend-plan §A.11 — one physical product: photos, price, stock,
// delivery areas and the store selling it. Ordering arrives with
// checkout (Phase 3).
function ProductPage() {
	const { id } = useParams();
	const location = useLocation();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const query = StoreServices.getProduct(id);
	// the product only carries storeId — the store's own page names it
	const storeId = query.data?.storeId;
	const store = StoreServices.getStore(storeId ? String(storeId) : '', {
		limit: 1,
	});

	return (
		<PublicPage
			query={query}
			noun="product"
			browseTo={ROUTES.STORE}
			browseLabel="Browse stores"
		>
			{(product) => {
				const seller = store.data?.available === false ? null : store.data;
				return (
					<div className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-8 xl:px-12">
						<Link
							to={seller ? storePath(seller) : ROUTES.STORE}
							className="font-label mb-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
						>
							<LuArrowLeft aria-hidden="true" />{' '}
							{seller ? seller.storeName : 'All stores'}
						</Link>

						<div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
							<Gallery images={product.images} alt={product.title} />

							<div className="flex flex-col gap-6">
								<div>
									<Eyebrow>
										{MATERIAL_CATEGORY_LABELS[product.category] ||
											humanize(product.category)}
									</Eyebrow>
									<h1 className="font-display mt-2 text-3xl leading-tight font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase md:text-4xl">
										{product.title}
									</h1>
									<div className="mt-4 flex flex-wrap items-center gap-3">
										<p className="font-display text-3xl font-semibold text-(--pg-text-primary)">
											{formatMoney(product.price, product.currency)}
											<span className="ml-1.5 font-sans text-base font-normal text-(--pg-text-secondary)">
												per {product.unit}
											</span>
										</p>
										<StatusBadge status={product.stockStatus} map={STOCK} />
									</div>
									{product.subCategory && (
										<div className="mt-4">
											<Chip>{product.subCategory}</Chip>
										</div>
									)}
								</div>

								{product.description && (
									<p className="text-[15.5px] leading-relaxed whitespace-pre-line text-(--pg-text-secondary)">
										{product.description}
									</p>
								)}

								<div className="flex flex-col gap-2">
									{isAuthenticated ? (
										<>
											<AppButton disabled>Order</AppButton>
											<span className="text-sm text-(--pg-text-secondary)">
												Ordering through PolyGrid opens soon.
											</span>
										</>
									) : (
										<AppButton
											to={ROUTES.LOGIN}
											state={{ from: location.pathname }}
											icon={<LuLogIn />}
										>
											Sign in to order
										</AppButton>
									)}
								</div>

								<ProfileSection>
									<h2 className="sc_sectionTitle inline-flex items-center gap-2">
										<LuTruck aria-hidden="true" /> Delivery
									</h2>
									<ul className="flex flex-col divide-y divide-(--pg-card-border)">
										{product.shippingLocations?.map((loc) => (
											<li
												key={`${loc.country}-${loc.state || ''}`}
												className="flex items-center justify-between gap-3 py-2.5 text-[15px]"
											>
												<span className="text-(--pg-text-primary)">
													{loc.state ? (
														<>
															<StateName
																country={loc.country}
																code={loc.state}
															/>
															, {countryName(loc.country)}
														</>
													) : (
														`Anywhere in ${countryName(loc.country)}`
													)}
												</span>
												<span className="font-semibold text-(--pg-text-primary)">
													{loc.price === 0
														? 'Free'
														: formatMoney(loc.price, product.currency)}
												</span>
											</li>
										))}
									</ul>
									<p className="mt-2 text-sm text-(--pg-text-secondary)">
										Not listed? This product can’t be delivered there.
									</p>
								</ProfileSection>

								{seller && (
									<Link
										to={storePath(seller)}
										className="flex items-center gap-4 rounded-2xl border border-(--pg-card-border) bg-(--pg-card-background) p-4 hover:border-(--pg-card-borderHover)"
									>
										<ProfileAvatar
											avatar={seller.logo}
											name={seller.storeName}
											size={48}
										/>
										<span className="min-w-0">
											<span className="block text-xs text-(--pg-text-secondary)">
												Sold by
											</span>
											<span className="block truncate font-semibold text-(--pg-text-primary)">
												{seller.storeName}
											</span>
										</span>
									</Link>
								)}
							</div>
						</div>
					</div>
				);
			}}
		</PublicPage>
	);
}

export default ProductPage;
