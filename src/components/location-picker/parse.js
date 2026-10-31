// "6.52, 3.37" → { lat, lng } | null
export const parseLatLng = (text) => {
	const m = String(text || '')
		.trim()
		.match(/^(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)$/);
	if (!m) return null;
	const lat = Number(m[1]);
	const lng = Number(m[2]);
	return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
};
