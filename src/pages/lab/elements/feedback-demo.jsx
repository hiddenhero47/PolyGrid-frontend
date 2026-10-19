import React from 'react';
import { LuSearchX, LuCloudOff, LuRotateCw } from 'react-icons/lu';
import AppLoader from '../../../components/loader';
import EmptyState from '../../../components/empty-state';
import UnavailableState from '../../../components/empty-state/unavailable-state';
import { AppButton } from '../../../components/button';
import { toast } from '../../../layouts/toast/toast-handler';
import { ROUTES } from '../../../utilities/app-routes';
import { LabSection, StateCell } from './lab-section';

function FeedbackDemo() {
	return (
		<LabSection
			id="feedback"
			title="Loaders, empty states & toasts"
			note="AppLoader (the grid wave), EmptyState for any 'nothing here' panel, UnavailableState for the backend's { available: false } answer (frontend-plan §2 — not a 404), and themed toasts through the same toast.success / error / info / warning calls."
		>
			<div className="flex flex-col gap-10">
				<div className="grid gap-6 sm:grid-cols-3">
					<StateCell tag="Loader — small">
						<AppLoader size={20} />
					</StateCell>
					<StateCell tag="Loader — default + label">
						<AppLoader showLabel label="Loading consultants" />
					</StateCell>
					<StateCell tag="Loader — large">
						<AppLoader size={56} />
					</StateCell>
				</div>

				<div>
					<p className="font-label mb-3 text-[11px] font-semibold tracking-[0.14em] text-(--pg-text-highlight) uppercase">
						Toasts
					</p>
					<div className="flex flex-wrap gap-3">
						<AppButton
							variant="secondary"
							onClick={() => toast.success('Profile saved')}
						>
							Success
						</AppButton>
						<AppButton
							variant="secondary"
							onClick={() =>
								toast.error('Couldn’t upload the file — it’s larger than 10 MB')
							}
						>
							Error
						</AppButton>
						<AppButton
							variant="secondary"
							onClick={() =>
								toast.warning('Your subscription ends in 3 days', {
									actionText: 'Renew now',
									onAction: () => toast.info('Would open billing'),
								})
							}
						>
							Warning + action
						</AppButton>
						<AppButton
							variant="secondary"
							onClick={() => toast.info('New tenders were posted in your area')}
						>
							Info
						</AppButton>
					</div>
				</div>

				<div className="grid gap-6 rounded-2xl border border-(--pg-card-border) lg:grid-cols-3">
					<EmptyState
						compact
						icon={<LuSearchX />}
						title="No matches"
						text="No consultants match these filters. Try widening the discipline or location."
						actions={
							<AppButton size="sm" variant="secondary">
								Clear filters
							</AppButton>
						}
					/>
					<UnavailableState
						browseTo={ROUTES.ENGINEERING}
						browseLabel="Browse consultants"
					/>
					<EmptyState
						compact
						tone="error"
						icon={<LuCloudOff />}
						title="Couldn’t load"
						text="We couldn’t reach PolyGrid. Check your connection and try again."
						actions={
							<AppButton size="sm" icon={<LuRotateCw />}>
								Retry
							</AppButton>
						}
						role="alert"
					/>
				</div>
			</div>
		</LabSection>
	);
}

export default FeedbackDemo;
