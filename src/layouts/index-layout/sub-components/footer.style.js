import styled from 'styled-components';

export const FooterWrapper = styled.footer`
	width: 100%;
	background-color: ${({ theme }) => theme.footer.background};
	border-top: 1px solid ${({ theme }) => theme.footer.border};
	color: ${({ theme }) => theme.footer.text};

	.sc_heading {
		font-family: var(--font-label);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.footer.heading};
	}

	.sc_link {
		font-size: 15px;
		color: ${({ theme }) => theme.footer.link};
		transition: color 0.2s ease;

		&:hover {
			color: ${({ theme }) => theme.footer.linkHover};
		}
	}

	.sc_bottom {
		border-top: 1px solid ${({ theme }) => theme.footer.border};
		font-family: var(--font-label);
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
`;
