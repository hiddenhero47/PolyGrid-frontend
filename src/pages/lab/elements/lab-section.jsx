import React from 'react';
import PropTypes from 'prop-types';
import { LabSection as Wrapper, StateTag } from './index.style';

export function LabSection({ id, title, note, children }) {
	return (
		<Wrapper id={id} className="scroll-mt-24">
			<header className="sc_head">
				<h2 className="sc_title">{title}</h2>
				{note && <p className="sc_note">{note}</p>}
			</header>
			<div className="sc_body">{children}</div>
		</Wrapper>
	);
}

LabSection.propTypes = {
	id: PropTypes.string,
	title: PropTypes.string.isRequired,
	note: PropTypes.node,
	children: PropTypes.node,
};

// One captioned cell in a states grid.
export function StateCell({ tag, children }) {
	return (
		<div>
			<StateTag>{tag}</StateTag>
			{children}
		</div>
	);
}

StateCell.propTypes = {
	tag: PropTypes.string.isRequired,
	children: PropTypes.node,
};
