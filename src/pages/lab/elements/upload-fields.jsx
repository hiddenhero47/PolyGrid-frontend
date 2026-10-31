import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CustomFile, CustomTags } from '../../../components/form-components';
import { LabSection, StateCell } from './lab-section';

const GRID = 'grid gap-8 sm:grid-cols-2';
const MB = 1024 * 1024;

// The file drop zone (single / multiple, type and size checked in the
// browser, image previews) and the Enter / comma tag input.
function UploadFields({ variant }) {
	const [photos, setPhotos] = useState([]);
	const [contract, setContract] = useState(null);
	const [tags, setTags] = useState(['Formwork', 'Rebar']);

	return (
		<LabSection
			id="uploads"
			title="File & tags"
			note="CustomFile: drop or browse; wrong types and oversized files are refused with a note. CustomTags: Enter or comma adds, Backspace on empty removes the last."
		>
			<div className={GRID}>
				<StateCell tag="Multiple · images · max 4">
					<CustomFile
						label="Site photos"
						multiple
						maxFiles={4}
						accept="image/jpeg,image/png,image/webp"
						acceptLabel="JPG, PNG or WebP"
						value={photos}
						onChange={setPhotos}
						variant={variant}
					/>
				</StateCell>
				<StateCell tag="Single · PDF / DOCX · 2 MB · compact">
					<CustomFile
						label="Contract"
						compact
						maxSize={2 * MB}
						accept=".pdf,.docx"
						acceptLabel="PDF or Word"
						value={contract}
						onChange={setContract}
						variant={variant}
					/>
				</StateCell>
				<StateCell tag="Error">
					<CustomFile
						label="Required file"
						required
						isError
						errormessage="Attach your ID"
						variant={variant}
					/>
				</StateCell>
				<StateCell tag="Disabled">
					<CustomFile label="Locked" disabled variant={variant} />
				</StateCell>
				<StateCell tag="Tags">
					<CustomTags
						label="What it covers"
						placeholder="Type, then Enter"
						value={tags}
						onChange={setTags}
						variant={variant}
					/>
				</StateCell>
				<StateCell tag="Tags · error">
					<CustomTags
						label="Choices"
						value={['One']}
						isError
						errormessage="Give at least two choices"
						variant={variant}
					/>
				</StateCell>
			</div>
		</LabSection>
	);
}

UploadFields.propTypes = { variant: PropTypes.string };

export default UploadFields;
