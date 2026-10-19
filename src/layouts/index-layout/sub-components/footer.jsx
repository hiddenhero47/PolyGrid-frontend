import React from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../../../components/logo';
import { ROUTES } from '../../../utilities/app-routes';
import { FooterWrapper } from './footer.style';

const COLUMNS = [
	{
		heading: 'Pillars',
		links: [
			{ label: 'Engineering consultants', to: ROUTES.ENGINEERING },
			{ label: 'Tenders & contractors', to: ROUTES.TENDERS },
			{ label: 'Materials store', to: ROUTES.STORE },
			{ label: 'Digital files', to: ROUTES.DIGITAL_STORE },
			{ label: 'SiteForce jobs', to: ROUTES.SITEFORCE },
		],
	},
	{
		heading: 'Account',
		links: [
			{ label: 'Create an account', to: ROUTES.REGISTER },
			{ label: 'Sign in', to: ROUTES.LOGIN },
			{ label: 'Forgot password', to: ROUTES.FORGOT_PASSWORD },
		],
	},
	{
		heading: 'Company',
		links: [
			{ label: 'About us', to: ROUTES.ABOUT },
			{ label: 'Privacy policy', to: ROUTES.PRIVACY },
			{ label: 'Terms & conditions', to: ROUTES.TERMS },
		],
	},
];

function Footer() {
	return (
		<FooterWrapper>
			<div className="mx-auto grid w-full max-w-[1440px] gap-12 px-4 py-16 md:px-8 lg:grid-cols-[1.4fr_2fr] xl:px-12">
				<div className="max-w-sm">
					<AppLogo />
					<p className="mt-5 leading-relaxed">
						One account for construction and engineering — consultants, tenders,
						materials, drafting files and site work, all verified.
					</p>
				</div>

				<div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
					{COLUMNS.map(({ heading, links }) => (
						<div key={heading}>
							<h3 className="sc_heading">{heading}</h3>
							<ul className="mt-5 flex flex-col gap-3">
								{links.map(({ label, to }) => (
									<li key={to}>
										<Link to={to} className="sc_link">
											{label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>

			<div className="sc_bottom">
				<div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8 xl:px-12">
					<span>
						© {new Date().getFullYear()} PolyGrid. All rights reserved.
					</span>
					<span>Engineering · Tenders · Store · SiteForce</span>
				</div>
			</div>
		</FooterWrapper>
	);
}

export default Footer;
