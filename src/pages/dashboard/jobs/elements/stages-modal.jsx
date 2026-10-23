import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/modal/index_modal';
import { AppButton } from '../../../../components/button';
import StageEditor from './stage-editor';
import { stagesTotal } from './job-helpers';

const toEditable = (stages = []) =>
	stages.map((s) => ({
		payment: String(s.payment ?? ''),
		details: s.details || [],
	}));

// Propose a new stage breakdown for an active job (the other side
// accepts or rejects it). Starts from the current stages.
function StagesModal({ refName, job, onSubmit, isPending }) {
	const [stages, setStages] = useState(() => toEditable(job?.stages));
	const [error, setError] = useState('');
	const total = stagesTotal(stages);

	const submit = () => {
		if (!stages.length) return setError('Add at least one stage');
		if (stages.some((s) => !(Number(s.payment) > 0)))
			return setError('Every stage needs a share above 0%');
		if (total > 100)
			return setError('Stage shares can’t add up to more than 100%');
		setError('');
		onSubmit(
			stages.map((s) => ({ payment: Number(s.payment), details: s.details }))
		);
	};

	return (
		<Modal.Center
			refName={refName}
			width="720px"
			queryWidth="100%"
			onOpen={() => setStages(toEditable(job?.stages))}
		>
			<Modal.Card
				eyebrow="Stages"
				title="Propose new stages"
				subtitle="The other side has to accept before they replace the current ones. Stages already verified stay paid."
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton onClick={submit} disabled={isPending}>
							{isPending ? 'Sending…' : 'Send proposal'}
						</AppButton>
					</>
				}
			>
				<StageEditor
					value={stages}
					onChange={setStages}
					totalAmount={job?.totalAmount}
					currency={job?.currency}
					error={error}
				/>
			</Modal.Card>
		</Modal.Center>
	);
}

StagesModal.propTypes = {
	refName: PropTypes.object.isRequired,
	job: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool,
};

export default StagesModal;
