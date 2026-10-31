import styled from 'styled-components';

export const MapFrame = styled.div`
	position: relative;
	overflow: hidden;
	border: 1px solid ${({ theme }) => theme.form.border};
	border-radius: 14px;
	isolation: isolate;

	.leaflet-container {
		height: ${({ $height }) => $height}px;
		width: 100%;
		background: ${({ theme }) => theme.surface.card};
		font-family: inherit;
		cursor: crosshair;
	}

	/* OSM only has light tiles — dim and invert them for dark themes */
	${({ $dark }) =>
		$dark &&
		`.leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9); }`}

	.leaflet-control-attribution {
		font-size: 10px;
	}
`;
