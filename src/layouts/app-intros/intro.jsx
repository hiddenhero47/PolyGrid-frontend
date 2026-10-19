import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LogoMark from '../../assets/brand/logo-mark.svg?react';
import { IntroWrapper } from './index.style';

const PILLARS = ['Engineering', 'Tenders', 'Store', 'SiteForce'];
const OUTROS = ['pgIntroOut', 'pgIntroOutNow'];

// Same contract as HM's intro: onstart fires when the lift-off begins
// (the layout starts revealing the navbar), onend when it's finished
// (the layout unmounts this).
function Intro({ onstart, onend }) {
	const [skip, setSkip] = useState(false);

	const handleAnimationStart = (e) => {
		if (OUTROS.includes(e.animationName)) onstart?.();
	};

	const handleAnimationEnd = (e) => {
		if (OUTROS.includes(e.animationName)) onend?.();
	};

	return (
		<IntroWrapper
			$skip={skip}
			onAnimationStart={handleAnimationStart}
			onAnimationEnd={handleAnimationEnd}
			role="presentation"
		>
			<div className="sc_grid" />
			<div className="sc_glow" />

			<div className="sc_content">
				<div className="sc_lockup">
					<LogoMark className="sc_mark" aria-hidden="true" />
					<div className="sc_divider" />
					<div className="sc_word" aria-label="PolyGrid">
						<span className="sc_first">Poly</span>
						<span className="sc_second">Grid</span>
					</div>
				</div>

				<div className="sc_pillars" aria-hidden="true">
					{PILLARS.map((pillar, index) => (
						<React.Fragment key={pillar}>
							{index > 0 && (
								<span
									className="sc_dot"
									style={{ animationDelay: `${1.7 + index * 0.18 - 0.09}s` }}
								>
									·
								</span>
							)}
							<span style={{ animationDelay: `${1.7 + index * 0.18}s` }}>
								{pillar}
							</span>
						</React.Fragment>
					))}
				</div>
			</div>

			<div className="sc_progress" />

			{!skip && (
				<button type="button" className="sc_skip" onClick={() => setSkip(true)}>
					Skip
				</button>
			)}
		</IntroWrapper>
	);
}

Intro.propTypes = {
	onstart: PropTypes.func,
	onend: PropTypes.func,
};

export default Intro;
