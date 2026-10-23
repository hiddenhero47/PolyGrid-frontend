import styled from 'styled-components';

// A product in a seller's list.
export const ProductRow = styled.button`
	display: flex;
	align-items: center;
	gap: 14px;
	width: 100%;
	padding: 12px 16px 12px 12px;
	border: 1px solid ${({ theme }) => theme.card.border};
	border-radius: 14px;
	background-color: ${({ theme }) => theme.surface.background};
	text-align: left;
	transition: border-color 0.18s ease;

	&:hover {
		border-color: ${({ theme }) => theme.card.borderHover};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}

	.sc_thumb {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		overflow: hidden;
		border-radius: 10px;
		font-size: 22px;
		background-color: ${({ theme }) => theme.surface.elevated};
		color: ${({ theme }) => theme.text.secondary};

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.sc_title {
		display: block;
		overflow: hidden;
		font-size: 15.5px;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: ${({ theme }) => theme.text.primary};
	}

	.sc_meta {
		display: block;
		margin-top: 3px;
		font-size: 13.5px;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_price {
		margin-left: auto;
		flex-shrink: 0;
		text-align: right;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};

		small {
			display: block;
			font-size: 12.5px;
			font-weight: 400;
			color: ${({ theme }) => theme.text.secondary};
		}
	}
`;
