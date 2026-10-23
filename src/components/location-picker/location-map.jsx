import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { THEMES } from '../../theme';
import { MapFrame } from './index.style';

// A read-only map with one pin (an unlocked job site).
function LocationMap({ lat, lng, height = 240 }) {
	const { theme } = useSelector((state) => state.themes);
	return (
		<MapFrame $height={height} $dark={THEMES[theme]?.mode === 'dark'}>
			<MapContainer
				center={[lat, lng]}
				zoom={15}
				scrollWheelZoom={false}
				style={{ cursor: 'grab' }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<CircleMarker
					center={[lat, lng]}
					radius={10}
					pathOptions={{
						color: '#ffffff',
						weight: 3,
						fillColor: '#FF5B3D',
						fillOpacity: 1,
					}}
				/>
			</MapContainer>
		</MapFrame>
	);
}

LocationMap.propTypes = {
	lat: PropTypes.number.isRequired,
	lng: PropTypes.number.isRequired,
	height: PropTypes.number,
};

export default LocationMap;
