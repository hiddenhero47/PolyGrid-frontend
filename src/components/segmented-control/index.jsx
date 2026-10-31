import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// A row of mutually exclusive buttons — queue status tabs, editor
// sections. Buttons with aria-pressed (not role="tab"): each one just
// switches what the page shows, usually via the URL.
//   <SegmentedControl label="Status" options={[{ value, label, count? }]}
//     value={status} onChange={setStatus} />

const Group = styled.div`
	display: inline-flex;
	flex-wrap: wrap;
	gap: 4px;
	max-width: 100%;
	padding: 4px;
	border: 1px solid ${({ theme }) => theme.border.default};
	border-radius: 14px;
	background-color: ${({ theme }) => theme.surface.background};

	button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 36px;
		padding: 0 14px;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		white-space: nowrap;
		color: ${({ theme }) => theme.text.secondary};
		transition:
			background-color 0.18s ease,
			color 0.18s ease;

		&:hover {
			color: ${({ theme }) => theme.text.primary};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.border.focus};
			outline-offset: 2px;
		}

		&[aria-pressed='true'] {
			background-color: ${({ theme }) => theme.tab.activeBg};
			color: ${({ theme }) => theme.tab.activeText};
		}
	}

	.sc_count {
		min-width: 20px;
		padding: 1px 6px;
		border-radius: 999px;
		font-size: 11.5px;
		background-color: ${({ theme }) => theme.state.hover};
	}
`;

function SegmentedControl({ label, options = [], value, onChange, className }) {
	return (
		<Group role="group" aria-label={label} className={className}>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					aria-pressed={value === option.value}
					onClick={() => onChange(option.value)}
				>
					{option.label}
					{option.count != null && (
						<span className="sc_count">{option.count}</span>
					)}
				</button>
			))}
		</Group>
	);
}

SegmentedControl.propTypes = {
	label: PropTypes.string.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.node.isRequired,
			count: PropTypes.number,
		})
	),
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	className: PropTypes.string,
};

export default SegmentedControl;
