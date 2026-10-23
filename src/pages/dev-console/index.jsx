import React from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import DeploymentPanel from './elements/deployment-panel';
import RequestBuilder from './elements/request-builder';

// TEMPORARY, development only (/dev-console) — a place to run the
// backend's deployment setup and poke at any route. Not in production
// builds (App.jsx loads it only under import.meta.env.DEV). Delete this
// folder and its route before going live.
function DevConsole() {
	return (
		<div className="mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-10 md:px-8 xl:px-12">
			<header>
				<p className="font-label text-xs font-semibold tracking-[0.16em] text-(--pg-accent-default) uppercase">
					Dev only · /dev-console
				</p>
				<h1 className="font-display mt-2 text-5xl font-semibold text-(--pg-text-primary) uppercase">
					Dev console
				</h1>
				<p className="mt-4 flex items-center gap-2 text-sm font-semibold text-(--pg-status-warning)">
					<LuTriangleAlert aria-hidden="true" />
					Temporary tool — delete pages/dev-console and its route before launch.
				</p>
			</header>

			<DeploymentPanel />
			<RequestBuilder />
		</div>
	);
}

export default DevConsole;
