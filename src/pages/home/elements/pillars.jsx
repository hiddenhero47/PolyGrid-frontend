import React from 'react';
import PropTypes from 'prop-types';
import {
	LuBuilding2,
	LuMountain,
	LuWaves,
	LuDraftingCompass,
	LuGraduationCap,
	LuFileText,
	LuEyeOff,
	LuTrophy,
	LuMapPin,
	LuLock,
} from 'react-icons/lu';
import { ArrowLink } from '../../../components/button';
import { ROUTES } from '../../../utilities/app-routes';
import bimImage from '../../../assets/images/home/bim-blueprint.jpg';
import rebarImage from '../../../assets/images/home/steel-rebar.jpg';
import yardImage from '../../../assets/images/home/precast-yard.jpg';
import siteImage from '../../../assets/images/home/site-excavation.jpg';
import {
	BlockTitle,
	Card,
	Chip,
	Eyebrow,
	GlassNote,
	GlassTag,
	IconBox,
	ImagePanel,
	NumberBadge,
	SectionTitle,
} from './index.style';

// One block per pillar, text and visual alternating sides (frontend-plan
// §A.1, after the Exery reference's alternating feature rows).
function PillarBlock({
	number,
	eyebrow,
	title,
	text,
	chips,
	link,
	visual,
	flip,
}) {
	return (
		<Card className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
			<div className={flip ? 'lg:order-2' : ''}>
				<div className="flex items-center gap-3">
					<NumberBadge>{number}</NumberBadge>
					<Eyebrow $highlight>{eyebrow}</Eyebrow>
				</div>
				<BlockTitle className="mt-5">{title}</BlockTitle>
				<p className="mt-4 max-w-xl text-[16px] leading-relaxed text-(--pg-text-secondary)">
					{text}
				</p>
				<div className="mt-6 flex flex-wrap gap-2">
					{chips.map((chip) => (
						<Chip key={chip}>{chip}</Chip>
					))}
				</div>
				<ArrowLink to={link.to} className="mt-8">
					{link.label}
				</ArrowLink>
			</div>
			<div className={flip ? 'lg:order-1' : ''}>{visual}</div>
		</Card>
	);
}

PillarBlock.propTypes = {
	number: PropTypes.number.isRequired,
	eyebrow: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
	chips: PropTypes.arrayOf(PropTypes.string).isRequired,
	link: PropTypes.shape({ to: PropTypes.string, label: PropTypes.string })
		.isRequired,
	visual: PropTypes.node.isRequired,
	flip: PropTypes.bool,
};

// ── Visuals ──────────────────────────────────────────────────────────

// consultancyProfileModel.ts SPECIALIZATION + isMentor
const SPECIALIZATIONS = [
	{ icon: <LuBuilding2 />, label: 'Structural' },
	{ icon: <LuMountain />, label: 'Geotechnical' },
	{ icon: <LuWaves />, label: 'Hydraulic & water' },
	{ icon: <LuDraftingCompass />, label: 'Architectural' },
];

function EngineeringVisual() {
	return (
		<div className="grid grid-cols-2 gap-3">
			{SPECIALIZATIONS.map(({ icon, label }) => (
				<div
					key={label}
					className="flex flex-col gap-6 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-sunken) p-5"
				>
					<IconBox>{icon}</IconBox>
					<span className="font-display text-lg font-medium tracking-[0.02em] text-(--pg-text-primary) uppercase">
						{label}
					</span>
				</div>
			))}
			<div className="col-span-2 flex items-center gap-4 rounded-2xl border border-dashed border-(--pg-border-strong) p-5">
				<IconBox>
					<LuGraduationCap />
				</IconBox>
				<p className="text-[14px] leading-snug text-(--pg-text-secondary)">
					<span className="font-semibold text-(--pg-text-primary)">
						Mentorship track —
					</span>{' '}
					senior engineers mentoring juniors, paid or free.
				</p>
			</div>
		</div>
	);
}

const TENDER_STEPS = [
	{
		icon: <LuFileText />,
		title: 'Post the project',
		text: 'Scope, budget, deadline.',
	},
	{
		icon: <LuEyeOff />,
		title: 'Bids stay sealed',
		text: 'Each contractor sees only their own.',
	},
	{
		icon: <LuTrophy />,
		title: 'Award & pay in stages',
		text: 'Money held until each stage is done.',
	},
];

function TendersVisual() {
	return (
		<ImagePanel className="min-h-95">
			<img
				src={yardImage}
				alt="Precast concrete bridge beams stacked in a logistics yard"
				loading="lazy"
			/>
			<div className="sc_layer flex flex-col justify-end gap-2 p-4 sm:p-5">
				{TENDER_STEPS.map(({ icon, title, text }) => (
					<GlassNote key={title}>
						<IconBox $size={36}>{icon}</IconBox>
						<span className="flex flex-col gap-0.5">
							<span className="sc_title">{title}</span>
							<span className="sc_text">{text}</span>
						</span>
					</GlassNote>
				))}
			</div>
		</ImagePanel>
	);
}

const STORE_ITEMS = [
	{
		image: bimImage,
		alt: 'Technical CAD wireframe of a bridge foundation joint',
		tag: 'Digital files',
		title: 'Drafting files & BIM models',
		text: 'Instant download after purchase',
	},
	{
		image: rebarImage,
		alt: 'Bundled steel rebar ready for a foundation pour',
		tag: 'Building materials',
		title: 'Steel, cement & more',
		text: 'Ordered from verified stores',
	},
];

function StoreVisual() {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{STORE_ITEMS.map(({ image, alt, tag, title, text }) => (
				<div
					key={title}
					className="overflow-hidden rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-sunken)"
				>
					<ImagePanel $flat className="h-44">
						<img src={image} alt={alt} loading="lazy" />
					</ImagePanel>
					<div className="p-5">
						<Eyebrow $highlight>{tag}</Eyebrow>
						<p className="font-display mt-2 text-xl font-medium tracking-[0.02em] text-(--pg-text-primary) uppercase">
							{title}
						</p>
						<p className="mt-1 text-[14px] text-(--pg-text-secondary)">
							{text}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}

function SiteForceVisual() {
	return (
		<ImagePanel className="min-h-95">
			<img
				src={siteImage}
				alt="A crew standing at the edge of a large excavation site"
				loading="lazy"
			/>
			<div className="sc_layer flex flex-col justify-between gap-4 p-4 sm:p-5">
				<GlassTag className="self-start">
					{/* jobOpeningController.ts DEFAULT_RADIUS_KM */}
					<span className="sc_label">Default search radius</span>
					<span className="sc_value">
						50 km <span className="sc_accent">around the site</span>
					</span>
				</GlassTag>
				<GlassNote>
					<IconBox $size={36}>
						<LuLock />
					</IconBox>
					<span className="flex flex-col gap-0.5">
						<span className="sc_title">Two-tier reveal</span>
						<span className="sc_text">
							Workers see the area and pay first. The exact address and contact
							unlock only once you accept them.
						</span>
					</span>
				</GlassNote>
			</div>
		</ImagePanel>
	);
}

// ── Section ──────────────────────────────────────────────────────────

const PILLARS = [
	{
		eyebrow: 'Engineering',
		title: 'Hire verified engineering consultants',
		text: 'Find verified structural, geotechnical, hydraulic and architectural consultants. Book a fixed package, an hourly engagement or a single session — and get mentored on the way up.',
		chips: ['Fixed packages', 'Hourly', 'Per session', 'Mentorship'],
		link: { to: ROUTES.ENGINEERING, label: 'Browse consultants' },
		visual: <EngineeringVisual />,
	},
	{
		eyebrow: 'Tenders',
		title: 'Sealed bids for real projects',
		text: 'Post a project and receive sealed bids from verified contractors, or hire one directly. Payment sits in escrow and is released stage by stage as work is confirmed.',
		chips: [
			'Sealed bids',
			'Direct hire',
			'Staged payments',
			'Disputes handled',
		],
		link: { to: ROUTES.TENDERS, label: 'See open tenders' },
		visual: <TendersVisual />,
	},
	{
		eyebrow: 'Store',
		title: 'Materials and drafting files',
		text: 'Two stores in one: buy building materials from verified suppliers, or download ready-made drawings, models and templates from digital creators.',
		chips: ['Physical materials', 'CAD & BIM files', 'Verified sellers'],
		link: { to: ROUTES.STORE, label: 'Visit the store' },
		visual: <StoreVisual />,
	},
	{
		eyebrow: 'SiteForce',
		title: 'Skilled hands, close to the site',
		text: 'Post a job opening with a location, and tradespeople nearby can apply — skilled or unskilled. Or hire a worker directly from their profile.',
		chips: ['Location search', 'Skilled & unskilled', 'Direct hire'],
		link: { to: ROUTES.SITEFORCE, label: 'Find site work' },
		visual: <SiteForceVisual />,
	},
];

function Pillars() {
	return (
		<section
			id="pillars"
			className="mx-auto w-full max-w-360 scroll-mt-24 px-4 md:px-8 xl:px-12"
		>
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<Eyebrow>Four pillars · one account</Eyebrow>
					<SectionTitle className="mt-3">Everything a build needs</SectionTitle>
				</div>
				<p className="max-w-md text-[16px] leading-relaxed text-(--pg-text-secondary)">
					From the first drawing to the last shift on site — expertise,
					contracts, supplies and labour in one verified marketplace.
				</p>
			</div>

			<div className="mt-10 flex flex-col gap-5">
				{PILLARS.map((pillar, index) => (
					<PillarBlock
						key={pillar.eyebrow}
						number={index + 1}
						flip={index % 2 === 1}
						{...pillar}
					/>
				))}
			</div>
		</section>
	);
}

export default Pillars;
