import React from 'react';
import { Link } from 'react-router-dom';

// A real 404 (unknown route). Distinct from the "unavailable" state a
// known-but-hidden profile returns — frontend-plan §2.
function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
			<p className="text-sm font-semibold text-(--pg-accent-default)">404</p>
			<h1 className="text-2xl font-bold text-(--pg-text-primary)">
				Page not found
			</h1>
			<p className="text-(--pg-text-secondary)">
				The page you’re looking for doesn’t exist.
			</p>
			<Link
				to="/"
				className="font-semibold text-(--pg-text-link) hover:underline"
			>
				Back to home
			</Link>
		</main>
	);
}

export default NotFound;
