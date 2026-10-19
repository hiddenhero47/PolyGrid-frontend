import React, { useState } from 'react';
import { LuRocket, LuInfo } from 'react-icons/lu';
import { AppButton } from '../../../components/button';
import StatusBadge from '../../../components/status-badge';
import { LabSection } from '../../lab/elements/lab-section';
import { sendRequest } from './request';
import ResponseView from './response-view';

// POST /api/deployment/setup (polygrid-backend deploymentController.ts):
// runs every setup task, each idempotent, and answers
//   { success, timestamp, results: [{ task, status, message }] }
// It's gated by timeWindowGuard in routes/deploymentRoutes.ts — outside
// that window it answers 403.

function DeploymentPanel() {
	const [running, setRunning] = useState(false);
	const [response, setResponse] = useState(null);

	const run = async () => {
		setRunning(true);
		setResponse(
			await sendRequest({ method: 'POST', path: '/api/deployment/setup' })
		);
		setRunning(false);
	};

	const results = response?.data?.results;
	const windowClosed = response?.status === 403;

	return (
		<LabSection
			id="deployment"
			title="Deployment setup"
			note="POST /api/deployment/setup — runs every setup task (Super Admin, verification templates, …). Each task is idempotent, so running it again is safe."
		>
			<div className="flex flex-col gap-6">
				<div className="flex flex-wrap items-center gap-4">
					<AppButton icon={<LuRocket />} onClick={run} disabled={running}>
						{running ? 'Running…' : 'Run setup'}
					</AppButton>
					{response?.data?.timestamp && (
						<span className="text-sm text-(--pg-text-secondary)">
							Last run {new Date(response.data.timestamp).toLocaleString()}
						</span>
					)}
				</div>

				{windowClosed && (
					<div className="flex gap-3 rounded-xl border border-(--pg-card-border) bg-(--pg-status-warningSoft) p-4 text-[15px] leading-relaxed text-(--pg-text-primary)">
						<LuInfo
							className="mt-1 shrink-0 text-(--pg-status-warning)"
							aria-hidden="true"
						/>
						<p>
							The setup window is closed. Open it in{' '}
							<code className="font-mono text-sm">
								polygrid-backend/src/routes/deploymentRoutes.ts
							</code>{' '}
							— update the start date in{' '}
							<code className="font-mono text-sm">
								timeWindowGuard(&quot;…&quot;, 72)
							</code>{' '}
							to now, restart the backend, then run again.
						</p>
					</div>
				)}

				{Array.isArray(results) && (
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-3">
							<span className="font-label text-xs font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
								Overall
							</span>
							<StatusBadge
								label={
									response.data.success
										? 'All tasks succeeded'
										: 'Some tasks failed'
								}
								tone={response.data.success ? 'success' : 'error'}
							/>
						</div>
						<ul className="flex flex-col divide-y divide-(--pg-table-rowBorder) rounded-xl border border-(--pg-card-border)">
							{results.map((result) => (
								<li
									key={result.task}
									className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<p className="font-semibold text-(--pg-text-primary)">
											{result.task}
										</p>
										<p className="mt-1 text-sm text-(--pg-text-secondary)">
											{result.message}
										</p>
									</div>
									<StatusBadge
										label={result.status}
										tone={result.status === 'success' ? 'success' : 'error'}
									/>
								</li>
							))}
						</ul>
					</div>
				)}

				<ResponseView response={response} />
			</div>
		</LabSection>
	);
}

export default DeploymentPanel;
