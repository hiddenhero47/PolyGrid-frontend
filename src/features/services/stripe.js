import { loadStripe } from '@stripe/stripe-js';

// Loaded on first use, not at startup — Stripe.js is only needed on the
// pages that take a payment. Wrap just those pages in
//   <Elements stripe={getStripe()} options={...}>
// rather than the whole app.
let stripePromise;

export const getStripe = () => {
	if (!stripePromise) {
		stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
	}
	return stripePromise;
};
