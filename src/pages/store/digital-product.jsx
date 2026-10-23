import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LuArrowLeft, LuLogIn, LuLock } from 'react-icons/lu';
import StoreServices from '../../features/services/custom-hooks/store';
import { selectIsAuthenticated } from '../../store/slice/auth';
import ProfileAvatar from '../../components/profile-avatar';
import { AppButton } from '../../components/button';
import { Eyebrow } from '../home/elements/index.style';
import { DIGITAL_PRODUCT_CATEGORY_LABELS } from '../../utilities/app-const';
import { formatMoney, humanize } from '../../utilities/basic-functions';
import { ROUTES, creatorPath } from '../../utilities/app-routes';
import PublicPage from './elements/page-states';
import Gallery from './elements/gallery';
import BuyDigital from './elements/buy-digital';

// frontend-plan §A.14 — one digital file, for discovery only: previews,
// description, price and the creator. The download is purchase-gated
// (§B.14): signed in, "Buy" pays through Stripe and the copy appears in
// Purchases.
function DigitalProductPage() {
	const { id } = useParams();
	const location = useLocation();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const query = StoreServices.getDigitalProduct(id);
	// the product only carries creatorId
	const creatorId = query.data?.creatorId;
	const creatorQuery = StoreServices.getCreator(
		creatorId ? String(creatorId) : '',
		{ limit: 1 }
	);
	const creator =
		creatorQuery.data?.available === false ? null : creatorQuery.data;

	return (
		<PublicPage
			query={query}
			noun="file"
			browseTo={ROUTES.DIGITAL_STORE}
			browseLabel="Browse digital files"
		>
			{(product) => (
				<div className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-8 xl:px-12">
					<Link
						to={creator ? creatorPath(creator) : ROUTES.DIGITAL_STORE}
						className="font-label mb-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-(--pg-text-secondary) uppercase hover:text-(--pg-text-primary)"
					>
						<LuArrowLeft aria-hidden="true" />{' '}
						{creator ? creator.displayName : 'Digital files'}
					</Link>

					<div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
						<Gallery images={product.previewImages} alt={product.title} />

						<div className="flex flex-col gap-6">
							<div>
								<Eyebrow>
									{DIGITAL_PRODUCT_CATEGORY_LABELS[product.category] ||
										humanize(product.category)}
								</Eyebrow>
								<h1 className="font-display mt-2 text-3xl leading-tight font-semibold tracking-[0.03em] text-(--pg-text-primary) uppercase md:text-4xl">
									{product.title}
								</h1>
								<p className="font-display mt-4 text-3xl font-semibold text-(--pg-text-primary)">
									{product.price === 0
										? 'Free'
										: formatMoney(product.price, product.currency)}
								</p>
							</div>

							{product.description && (
								<p className="text-[15.5px] leading-relaxed whitespace-pre-line text-(--pg-text-secondary)">
									{product.description}
								</p>
							)}

							<div className="flex flex-col gap-2">
								{isAuthenticated ? (
									<BuyDigital product={product} />
								) : (
									<AppButton
										to={ROUTES.LOGIN}
										state={{ from: location.pathname }}
										icon={<LuLogIn />}
									>
										Sign in to buy
									</AppButton>
								)}
								<p className="inline-flex items-center gap-2 text-sm text-(--pg-text-secondary)">
									<LuLock aria-hidden="true" /> The full files download after
									purchase.
								</p>
							</div>

							{creator && (
								<Link
									to={creatorPath(creator)}
									className="flex items-center gap-4 rounded-2xl border border-(--pg-card-border) bg-(--pg-card-background) p-4 hover:border-(--pg-card-borderHover)"
								>
									<ProfileAvatar
										avatar={creator.avatar}
										name={creator.displayName}
										size={48}
									/>
									<span className="min-w-0">
										<span className="block text-xs text-(--pg-text-secondary)">
											Made by
										</span>
										<span className="block truncate font-semibold text-(--pg-text-primary)">
											{creator.displayName}
										</span>
									</span>
								</Link>
							)}
						</div>
					</div>
				</div>
			)}
		</PublicPage>
	);
}

export default DigitalProductPage;
