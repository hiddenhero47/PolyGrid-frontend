import styled from 'styled-components';
import { Link } from 'react-router-dom';

// A product tile — physical or digital — linking to its page.
export const ProductTile = styled(Link)`
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border: 1px solid ${({ theme }) => theme.card.border};
	border-radius: 16px;
	background-color: ${({ theme }) => theme.card.background};
	transition:
		border-color 0.2s ease,
		transform 0.2s ease;

	&:hover {
		border-color: ${({ theme }) => theme.card.borderHover};
		transform: translateY(-2px);
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.border.focus};
		outline-offset: 2px;
	}

	.sc_media {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: ${({ $ratio }) => $ratio || '4 / 3'};
		font-size: 30px;
		background-color: ${({ theme }) => theme.surface.elevated};
		color: ${({ theme }) => theme.text.secondary};

		img {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.sc_tag {
		position: absolute;
		top: 10px;
		left: 10px;
		padding: 3px 9px;
		border-radius: 8px;
		font-family: var(--font-label);
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		background-color: ${({ theme }) => theme.glass.background};
		color: ${({ theme }) => theme.glass.text};
	}

	.sc_body {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 6px;
		padding: 14px 16px 16px;
	}

	.sc_title {
		display: -webkit-box;
		overflow: hidden;
		font-size: 15.5px;
		font-weight: 600;
		line-height: 1.35;
		color: ${({ theme }) => theme.text.primary};
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.sc_meta {
		font-size: 13px;
		color: ${({ theme }) => theme.text.secondary};
	}

	.sc_price {
		margin-top: auto;
		padding-top: 6px;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 600;
		color: ${({ theme }) => theme.text.primary};

		small {
			margin-left: 4px;
			font-family: var(--font-sans);
			font-size: 13px;
			font-weight: 400;
			color: ${({ theme }) => theme.text.secondary};
		}
	}

	@media (prefers-reduced-motion: reduce) {
		&:hover {
			transform: none;
		}
	}
`;

// Main image + thumbnails on product pages.
export const GalleryShell = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;

	.sc_main {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border: 1px solid ${({ theme }) => theme.card.border};
		border-radius: 18px;
		font-size: 40px;
		background-color: ${({ theme }) => theme.surface.elevated};
		color: ${({ theme }) => theme.text.secondary};

		img {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
	}

	.sc_thumbs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.sc_thumb {
		width: 72px;
		height: 72px;
		overflow: hidden;
		border: 2px solid transparent;
		border-radius: 12px;
		background-color: ${({ theme }) => theme.surface.elevated};

		&[aria-pressed='true'] {
			border-color: ${({ theme }) => theme.border.focus};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.border.focus};
			outline-offset: 2px;
		}

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}
`;
