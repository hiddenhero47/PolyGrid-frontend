import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuSearch, LuX } from 'react-icons/lu';
import { AppButton } from '../../../components/button';
import { CustomInput } from '../../../components/form-components';

// Name / email search for GET /api/users?q=. Searches on submit (no
// request per keystroke). The parent keys this by the URL's `q`, so the
// box re-mounts with the right text on Back/Forward or Clear — no effect.
function UserSearch({ q = '', onSearch }) {
	const [text, setText] = useState(q);

	return (
		<form
			role="search"
			onSubmit={(e) => {
				e.preventDefault();
				onSearch(text.trim());
			}}
			className="flex items-end gap-2 sm:w-[360px]"
		>
			<div className="flex-1">
				<CustomInput
					label="Search"
					name="q"
					type="search"
					variant="outline"
					placeholder="Name or email"
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
			</div>
			<AppButton type="submit" variant="secondary" aria-label="Search">
				<LuSearch aria-hidden="true" />
			</AppButton>
			{q && (
				<AppButton
					variant="secondary"
					aria-label="Clear search"
					onClick={() => onSearch('')}
				>
					<LuX aria-hidden="true" />
				</AppButton>
			)}
		</form>
	);
}

UserSearch.propTypes = {
	q: PropTypes.string,
	onSearch: PropTypes.func.isRequired,
};

export default UserSearch;
