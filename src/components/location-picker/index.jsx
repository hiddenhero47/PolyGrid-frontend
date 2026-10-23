import React, { useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
	MapContainer,
	TileLayer,
	CircleMarker,
	useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LuCrosshair, LuX } from 'react-icons/lu';
import { THEMES } from '../../theme';
import { AppButton } from '../button';
import { CustomInput } from '../form-components';
import { MapFrame } from './index.style';
import { parseLatLng } from './parse';

// Nigeria (Lagos) until the user picks — the platform's home market
const FALLBACK = { lat: 6.5244, lng: 3.3792 };

const round = (n) => Math.round(n * 1e6) / 1e6;

function ClickToPin({ onPick }) {
	useMapEvents({
		click: (e) =>
			onPick({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) }),
	});
	return null;
}

ClickToPin.propTypes = { onPick: PropTypes.func.isRequired };

// frontend-plan §2 "Location picker": Leaflet + OpenStreetMap (no key, no
// billing). Click the map to drop the pin, or "Use my location"
// (browser geolocation), or paste "lat, lng". Value: { lat, lng } | null.
function LocationPicker({
	value,
	onChange,
	label = 'Exact location',
	hint,
	height = 300,
}) {
	const id = useId();
	const mapRef = useRef(null);
	const { theme } = useSelector((state) => state.themes);
	const dark = THEMES[theme]?.mode === 'dark';
	const [text, setText] = useState(value ? `${value.lat}, ${value.lng}` : '');
	const [textError, setTextError] = useState('');
	const [locating, setLocating] = useState(false);
	const [geoError, setGeoError] = useState('');
	// keep the text box in step when the pin moves (render-time sync, no effect)
	const [lastValue, setLastValue] = useState(value);
	if (value !== lastValue) {
		setLastValue(value);
		setText(value ? `${value.lat}, ${value.lng}` : '');
	}

	const pick = (point, fly = false) => {
		onChange(point);
		if (fly && point)
			mapRef.current?.flyTo([point.lat, point.lng], 15, { duration: 0.8 });
	};

	const locate = () => {
		if (!navigator.geolocation)
			return setGeoError('Your browser can’t share its location.');
		setLocating(true);
		setGeoError('');
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLocating(false);
				pick(
					{ lat: round(pos.coords.latitude), lng: round(pos.coords.longitude) },
					true
				);
			},
			() => {
				setLocating(false);
				setGeoError(
					'Couldn’t get your location — allow it in the browser, or click the map instead.'
				);
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	};

	const center = value || FALLBACK;

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<span
					id={`${id}-label`}
					className="font-label text-xs font-semibold tracking-[0.12em] text-(--pg-text-primary) uppercase"
				>
					{label}
				</span>
				<div className="flex flex-wrap gap-2">
					<AppButton
						variant="secondary"
						icon={<LuCrosshair />}
						onClick={locate}
						disabled={locating}
					>
						{locating ? 'Locating…' : 'Use my location'}
					</AppButton>
					{value && (
						<AppButton
							variant="secondary"
							icon={<LuX />}
							onClick={() => pick(null)}
						>
							Clear
						</AppButton>
					)}
				</div>
			</div>
			{hint && (
				<p className="-mt-1 text-sm text-(--pg-text-secondary)">{hint}</p>
			)}
			<MapFrame
				$height={height}
				$dark={dark}
				role="group"
				aria-labelledby={`${id}-label`}
			>
				<MapContainer
					ref={mapRef}
					center={[center.lat, center.lng]}
					zoom={value ? 15 : 11}
					scrollWheelZoom={false}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<ClickToPin onPick={pick} />
					{value && (
						<CircleMarker
							center={[value.lat, value.lng]}
							radius={10}
							pathOptions={{
								color: '#ffffff',
								weight: 3,
								fillColor: '#FF5B3D',
								fillOpacity: 1,
							}}
						/>
					)}
				</MapContainer>
			</MapFrame>
			{geoError && (
				<p className="text-sm text-(--pg-status-error)">{geoError}</p>
			)}
			<CustomInput
				label="Or paste coordinates"
				name={`${id}-latlng`}
				placeholder="e.g. 6.4281, 3.4219"
				hint="Latitude, longitude — Google Maps shows them when you long-press a spot."
				value={text}
				onChange={(e) => {
					setText(e.target.value);
					setTextError('');
				}}
				onBlur={() => {
					if (!text.trim()) return value && pick(null);
					const point = parseLatLng(text);
					if (!point)
						return setTextError(
							'Use “latitude, longitude”, e.g. 6.4281, 3.4219'
						);
					if (!value || point.lat !== value.lat || point.lng !== value.lng)
						pick(point, true);
				}}
				isError={Boolean(textError)}
				errormessage={textError}
			/>
		</div>
	);
}

LocationPicker.propTypes = {
	value: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
	onChange: PropTypes.func.isRequired,
	label: PropTypes.string,
	hint: PropTypes.string,
	height: PropTypes.number,
};

export default LocationPicker;
