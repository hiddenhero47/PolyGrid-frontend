import React from 'react';
import {
	LuArrowLeftRight,
	LuFingerprint,
	LuEyeOff,
	LuMapPin,
} from 'react-icons/lu';
import { Card, IconBox } from './index.style';

// The "trust badge" row from the Exery reference — each one a real
// platform rule, not a slogan.
const HIGHLIGHTS = [
	{
		icon: <LuArrowLeftRight />,
		title: 'One account',
		text: 'Switch between hiring and selling without a second sign-up.',
	},
	{
		icon: <LuFingerprint />,
		title: 'Verified profiles',
		text: 'Business profiles pass country-specific checks before they list.',
	},
	{
		icon: <LuEyeOff />,
		title: 'Sealed bidding',
		text: 'Contractors never see each other’s bids — only the poster does.',
	},
	{
		icon: <LuMapPin />,
		title: 'Hire near the site',
		text: 'SiteForce matches jobs and tradespeople by distance.',
	},
];

function Highlights() {
	return (
		<section className="mx-auto w-full max-w-360 px-4 md:px-8 xl:px-12">
			<Card className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8 xl:grid-cols-4">
				{HIGHLIGHTS.map(({ icon, title, text }) => (
					<div key={title} className="flex items-start gap-4">
						<IconBox>{icon}</IconBox>
						<div>
							<h3 className="font-display text-xl font-medium tracking-[0.02em] text-(--pg-text-primary) uppercase">
								{title}
							</h3>
							<p className="mt-1 text-[14px] leading-snug text-(--pg-text-secondary)">
								{text}
							</p>
						</div>
					</div>
				))}
			</Card>
		</section>
	);
}

export default Highlights;
