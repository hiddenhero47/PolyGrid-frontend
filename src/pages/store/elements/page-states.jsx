import React from 'react';
import PropTypes from 'prop-types';
import { LuSearchX, LuCloudOff, LuRotateCw } from 'react-icons/lu';
import AppLoader from '../../../components/loader';
import EmptyState from '../../../components/empty-state';
import UnavailableState from '../../../components/empty-state/unavailable-state';
import { AppButton } from '../../../components/button';

const wrap = (content) => (
	<div className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-8 xl:px-12">
		{content}
	</div>
);

// The states every public single view shares (frontend-plan §A / §2):
// loading → 404 → error → { available: false } → the page itself.
// `children` is a function of the loaded data, so it only runs once
// there's something to show:
//   <PublicPage query={q} noun="store" browseTo={…} browseLabel="…">
//     {(store) => …}
//   </PublicPage>
function PublicPage({ query, noun, browseTo, browseLabel, children }) {
	const { data, isPending, isError, error, refetch } = query;
	if (isPending)
		return wrap(<AppLoader fullPage showLabel label={`Loading ${noun}`} />);
	if (isError) {
		return wrap(
			error?.response?.status === 404 ? (
				<EmptyState
					icon={<LuSearchX />}
					eyebrow="404"
					title={`${noun[0].toUpperCase()}${noun.slice(1)} not found`}
					text="This link doesn’t match anything on PolyGrid. It may have been mistyped or removed."
					actions={
						browseTo && <AppButton to={browseTo}>{browseLabel}</AppButton>
					}
				/>
			) : (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title={`Couldn’t load this ${noun}`}
					text="Check your connection and try again."
					actions={
						<AppButton icon={<LuRotateCw />} onClick={() => refetch()}>
							Retry
						</AppButton>
					}
					role="alert"
				/>
			)
		);
	}
	if (data?.available === false) {
		return wrap(
			<UnavailableState
				message={data.message}
				browseTo={browseTo}
				browseLabel={browseLabel}
			/>
		);
	}
	return children(data);
}

PublicPage.propTypes = {
	query: PropTypes.object.isRequired,
	noun: PropTypes.string.isRequired,
	browseTo: PropTypes.string,
	browseLabel: PropTypes.string,
	children: PropTypes.func.isRequired,
};

export default PublicPage;
