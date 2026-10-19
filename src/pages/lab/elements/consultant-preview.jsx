import React from 'react';
import ConsultantCard from '../../engineering/elements/consultant-card';
import { LabSection } from './lab-section';

// Sample data in the backend's toPublicProfile() shape — the database has
// no subscribed consultants yet, so this is where the filled-in card is
// checked. Not used anywhere but /lab.
const SAMPLES = [
	{
		id: 'sample-1',
		slug: 'apex-structural-advisory',
		headline: 'Apex Structural Advisory',
		bio: 'Senior structural engineer — high-rise peer review, seismic retrofits and post-tensioned slabs. Fixed-scope audits or hourly advisory.',
		isVerified: true,
		country: 'NG',
		city: 'Lagos',
		yearsOfExperience: 14,
		specializations: ['structural', 'geotechnical'],
		services: [
			{
				_id: 's1',
				title: 'Structural audit report',
				pricingMode: 'fixed',
				price: 1800,
				currency: 'USD',
			},
			{
				_id: 's2',
				title: 'Advisory call',
				pricingMode: 'per_session',
				price: 120,
				currency: 'USD',
			},
		],
		mentorship: { isMentor: true, areas: ['Career', 'Design review'] },
		ratingAverage: 4.8,
		ratingCount: 37,
	},
	{
		id: 'sample-2',
		slug: 'tidewater-hydraulics',
		headline: 'Tidewater Hydraulics',
		bio: 'Drainage, flood modelling and coastal works.',
		isVerified: true,
		country: 'GH',
		yearsOfExperience: 6,
		specializations: ['hydraulic_water'],
		services: [
			{
				_id: 's3',
				title: 'Hourly consulting',
				pricingMode: 'hourly',
				price: 65,
				currency: 'GHS',
			},
		],
		mentorship: { isMentor: false, areas: [] },
		ratingAverage: 0,
		ratingCount: 0,
	},
	{
		id: 'sample-3',
		slug: 'form-and-frame-architects',
		headline: 'Form & Frame Architects',
		isVerified: false,
		country: 'GB',
		city: 'Manchester',
		specializations: ['architectural'],
		services: [],
		mentorship: { isMentor: true, areas: [] },
		ratingAverage: 4.2,
		ratingCount: 5,
	},
];

function ConsultantPreview() {
	return (
		<LabSection
			id="consultant-cards"
			title="Consultant card (sample data)"
			note="The real browse page is /engineering — empty until a consultant is verified and subscribed. These samples show the filled card: verified badge, location, years, rating (or 'New'), specializations, Mentor chip, cheapest service."
		>
			<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{SAMPLES.map((profile) => (
					<ConsultantCard key={profile.id} profile={profile} />
				))}
			</div>
		</LabSection>
	);
}

export default ConsultantPreview;
