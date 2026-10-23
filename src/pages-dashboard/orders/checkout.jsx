import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	LuMinus,
	LuPackage,
	LuPlus,
	LuShoppingCart,
	LuTrash2,
	LuTruck,
} from 'react-icons/lu';
import OrderServices from '../../features/services/custom-hooks/orders';
import ReferenceServices from '../../features/services/custom-hooks/reference';
import { getErrorMessage } from '../../features/services/index-client';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import EmptyState from '../../components/empty-state';
import { AppButton } from '../../components/button';
import {
	CustomSelect,
	CustomTextarea,
} from '../../components/form-components';
import {
	clearCartStore,
	lineShipping,
	removeFromCart,
	selectCartStore,
	setCartQuantity,
} from '../../store/slice/cart';
import { countryName, formatMoney } from '../../utilities/basic-functions';
import { ROUTES, productPath, storePath } from '../../utilities/app-routes';
import { BackLink, Panel } from '../elements/panels';

// frontend-plan §B.13 — check out one store's cart: delivery destination,
// note, and a per-line delivery price (or "doesn't deliver there"),
// worked out the way the backend does. Placing the order creates a Job
// with the store; the buyer confirms and pays into escrow there.
function Checkout() {
	const { storeId } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const entry = useSelector(selectCartStore(storeId));
	const create = OrderServices.create();
	const { data: countries = [] } = ReferenceServices.getCountries();
	const [country, setCountry] = useState('');
	const [state, setState] = useState('');
	const [note, setNote] = useState('');
	const [lineError, setLineError] = useState({}); // productId → message from the backend
	const { data: states = [] } = ReferenceServices.getStates(country);

	const back = (
		<BackLink to={`${ROUTES.DASHBOARD_ORDERS}?view=cart`}>Cart</BackLink>
	);

	if (!entry)
		return (
			<>
				{back}
				<EmptyState
					tone="accent"
					icon={<LuShoppingCart />}
					title="Nothing to check out"
					text="This store’s cart is empty — it may have been ordered already."
					actions={<AppButton to={ROUTES.STORE}>Browse stores</AppButton>}
				/>
			</>
		);

	const destination = country ? { country, ...(state && { state }) } : null;
	const currency = entry.items[0]?.currency;
	const lines = entry.items.map((item) => ({
		...item,
		shipping: lineShipping(item, destination),
		subtotal: item.price * item.quantity,
	}));
	const undeliverable = lines.filter((l) => l.shipping === null);
	const itemsTotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
	const shippingTotal = lines.reduce((sum, l) => sum + (l.shipping || 0), 0);
	// countries at least one line delivers to, first in the picker
	const served = new Set(
		entry.items.flatMap((i) =>
			(i.shippingLocations || []).map((r) => r.country)
		)
	);
	const countryOptions = [
		...countries.filter((c) => served.has(c.isoCode)),
		...countries.filter((c) => !served.has(c.isoCode)),
	].map((c) => ({
		value: c.isoCode,
		label: served.has(c.isoCode) ? `${c.name} · delivers` : c.name,
	}));

	const place = () =>
		create.mutate(
			{
				storeId,
				items: entry.items.map((i) => ({
					productId: i.productId,
					quantity: i.quantity,
				})),
				shippingDestination: destination,
				...(note.trim() && { note: note.trim() }),
			},
			{
				onSuccess: (order) => {
					dispatch(clearCartStore(storeId));
					toast.success(
						'Order placed — confirm it and pay into escrow to send it to the store',
						{
							title: 'Next: pay',
						}
					);
					navigate(`${ROUTES.DASHBOARD_JOBS}/${order.job?._id || order.job}`, {
						replace: true,
					});
				},
				onError: (error) => {
					const message = getErrorMessage(error);
					// "<title> does not ship to the requested destination" — pin it to its line
					const line = entry.items.find((i) =>
						message.startsWith(`${i.title} does not ship`)
					);
					if (line) setLineError({ [line.productId]: 'Doesn’t deliver there' });
					else toast.error(message);
				},
			}
		);

	return (
		<>
			{back}
			<PageHeader
				eyebrow="Checkout"
				title={entry.storeName}
				subtitle="One order per store. Prices are confirmed by the store’s live listing when you place it."
			/>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
				<div className="flex min-w-0 flex-col gap-5">
					<Panel
						title={`Items (${lines.length})`}
						icon={<LuPackage aria-hidden="true" />}
						action={
							<Link
								to={storePath({ slug: entry.slug, id: storeId })}
								className="text-sm text-(--pg-text-highlight) hover:underline"
							>
								Add more from this store
							</Link>
						}
					>
						<ul className="flex flex-col divide-y divide-(--pg-card-border)">
							{lines.map((line) => {
								const blocked =
									line.shipping === null || lineError[line.productId];
								return (
									<li
										key={line.productId}
										className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0"
									>
										<Link
											to={productPath({ id: line.productId })}
											className="shrink-0"
										>
											{line.image ? (
												<img
													src={line.image}
													alt=""
													className="size-16 rounded-xl object-cover"
												/>
											) : (
												<span className="grid size-16 place-items-center rounded-xl bg-(--pg-surface-card) text-(--pg-text-secondary)">
													<LuPackage aria-hidden="true" />
												</span>
											)}
										</Link>
										<div className="min-w-0 flex-1">
											<Link
												to={productPath({ id: line.productId })}
												className="block truncate font-semibold text-(--pg-text-primary) hover:underline"
											>
												{line.title}
											</Link>
											<p className="text-sm text-(--pg-text-secondary)">
												{formatMoney(line.price, line.currency)} per {line.unit}
											</p>
											<p
												className={`mt-1 inline-flex items-center gap-1.5 text-sm ${blocked ? 'font-semibold text-(--pg-status-error)' : 'text-(--pg-text-secondary)'}`}
											>
												<LuTruck aria-hidden="true" />
												{!destination
													? 'Choose where to deliver'
													: blocked
														? `Doesn’t deliver to ${countryName(country)}${state ? ` (${state})` : ''} — remove it to order the rest`
														: line.shipping === 0
															? 'Free delivery'
															: `Delivery ${formatMoney(line.shipping, line.currency)}`}
											</p>
										</div>
										<div className="inline-flex h-10 items-center rounded-xl border border-(--pg-form-border)">
											<button
												type="button"
												aria-label={`One less ${line.title}`}
												disabled={line.quantity <= 1}
												onClick={() =>
													dispatch(
														setCartQuantity({
															storeId,
															productId: line.productId,
															quantity: line.quantity - 1,
														})
													)
												}
												className="inline-flex h-full w-9 items-center justify-center text-(--pg-text-secondary) disabled:opacity-40"
											>
												<LuMinus aria-hidden="true" />
											</button>
											<span
												className="w-10 text-center text-sm font-semibold text-(--pg-text-primary)"
												aria-live="polite"
											>
												{line.quantity}
											</span>
											<button
												type="button"
												aria-label={`One more ${line.title}`}
												onClick={() =>
													dispatch(
														setCartQuantity({
															storeId,
															productId: line.productId,
															quantity: line.quantity + 1,
														})
													)
												}
												className="inline-flex h-full w-9 items-center justify-center text-(--pg-text-secondary)"
											>
												<LuPlus aria-hidden="true" />
											</button>
										</div>
										<span className="w-24 text-right font-semibold text-(--pg-text-primary)">
											{formatMoney(line.subtotal, line.currency)}
										</span>
										<button
											type="button"
											aria-label={`Remove ${line.title}`}
											onClick={() =>
												dispatch(
													removeFromCart({ storeId, productId: line.productId })
												)
											}
											className="inline-flex size-9 items-center justify-center rounded-lg text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-status-error)"
										>
											<LuTrash2 aria-hidden="true" />
										</button>
									</li>
								);
							})}
						</ul>
					</Panel>

					<Panel title="Delivery" icon={<LuTruck aria-hidden="true" />}>
						<div className="grid gap-5 sm:grid-cols-2">
							<CustomSelect
								label="Country"
								name="country"
								required
								placeholder="Choose"
								options={countryOptions}
								value={country}
								onChange={(v) => {
									setCountry(v);
									setState('');
									setLineError({});
								}}
							/>
							<CustomSelect
								label="State / region"
								name="state"
								placeholder={states.length ? 'Anywhere in the country' : '—'}
								clearable
								disabled={!states.length}
								options={states.map((s) => ({
									value: s.isoCode,
									label: s.name,
								}))}
								value={state}
								onChange={(v) => {
									setState(v || '');
									setLineError({});
								}}
								hint="Some stores price delivery by state"
							/>
						</div>
						<div className="mt-5">
							<CustomTextarea
								label="Note to the store"
								name="note"
								minHeight="96px"
								maxLength={1000}
								placeholder="Delivery address, site contact, timing."
								value={note}
								onChange={(e) => setNote(e.target.value)}
							/>
						</div>
					</Panel>
				</div>

				<aside>
					<Panel title="Summary" className="lg:sticky lg:top-4">
						<dl className="flex flex-col gap-2 text-sm">
							<div className="flex justify-between">
								<dt className="text-(--pg-text-secondary)">Items</dt>
								<dd className="font-semibold text-(--pg-text-primary)">
									{formatMoney(itemsTotal, currency)}
								</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-(--pg-text-secondary)">Delivery</dt>
								<dd className="font-semibold text-(--pg-text-primary)">
									{destination ? formatMoney(shippingTotal, currency) : '—'}
								</dd>
							</div>
							<div className="mt-2 flex items-baseline justify-between border-t border-(--pg-card-border) pt-3">
								<dt className="font-semibold text-(--pg-text-primary)">
									Total
								</dt>
								<dd className="font-display text-2xl font-semibold text-(--pg-text-primary)">
									{formatMoney(itemsTotal + shippingTotal, currency)}
								</dd>
							</div>
						</dl>
						<div className="mt-5 flex flex-col gap-2">
							<AppButton
								onClick={place}
								disabled={
									!destination || undeliverable.length > 0 || create.isPending
								}
							>
								{create.isPending ? 'Placing…' : 'Place order'}
							</AppButton>
							<p className="text-xs text-(--pg-text-secondary)">
								{!destination
									? 'Choose where to deliver first.'
									: undeliverable.length
										? `${undeliverable.length} item${undeliverable.length > 1 ? 's don’t' : ' doesn’t'} deliver there.`
										: 'Next you confirm the order and pay into escrow. The store is paid once you confirm delivery.'}
							</p>
						</div>
					</Panel>
				</aside>
			</div>
		</>
	);
}

export default Checkout;
