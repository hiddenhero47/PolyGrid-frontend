import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../components/modal/index_modal';
import { AppButton } from '../../../components/button';
import LocationPicker from '../../../components/location-picker';

// "Search near a place" — the manual fallback when the browser won't
// share its location (frontend-plan §B.11).
function NearModal({ refName, value, onSearch }) {
	const [point, setPoint] = useState(value);

	return (
		<Modal.Center
			refName={refName}
			width="680px"
			queryWidth="100%"
			onOpen={() => setPoint(value)}
		>
			<Modal.Card
				eyebrow="Search near"
				title="Pick a place"
				subtitle="Jobs are sorted by distance from this point."
				footer={
					<>
						<AppButton
							variant="secondary"
							onClick={() => refName.current.close()}
						>
							Cancel
						</AppButton>
						<AppButton
							disabled={!point}
							onClick={() => {
								onSearch(point);
								refName.current.close();
							}}
						>
							Search here
						</AppButton>
					</>
				}
			>
				<LocationPicker
					label="Where"
					value={point}
					onChange={setPoint}
					height={320}
				/>
			</Modal.Card>
		</Modal.Center>
	);
}

NearModal.propTypes = {
	refName: PropTypes.object.isRequired,
	value: PropTypes.object,
	onSearch: PropTypes.func.isRequired,
};

export default NearModal;
