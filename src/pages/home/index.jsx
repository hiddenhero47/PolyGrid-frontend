import React from 'react';
import Hero from './elements/hero';
import Highlights from './elements/highlights';
import Pillars from './elements/pillars';
import TopRated from './elements/top-rated';
import { LiveBoards, AccountCta } from './elements/account-cta';

// frontend-plan §A.1 — hero first, then the Exery reference's rhythm:
// trust row, alternating pillar blocks, a closing CTA band.
function Home() {
	return (
		<div className="flex flex-col gap-16 pb-20 lg:gap-24">
			<div className="flex flex-col gap-5">
				<Hero />
				<Highlights />
			</div>
			<Pillars />
			<TopRated />
			<div className="flex flex-col gap-5">
				<LiveBoards />
				<AccountCta />
			</div>
		</div>
	);
}

export default Home;
