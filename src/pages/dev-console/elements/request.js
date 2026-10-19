// Plain fetch on purpose — this tool must show every response exactly as
// the backend sent it (any status, no toasts, no interceptors).
// Relative /api/... paths go through Vite's dev proxy like the app does.

export const sendRequest = async ({ method, path, body, token }) => {
	const url = path.startsWith('/') ? path : `/${path}`;
	const headers = { Accept: 'application/json' };
	const hasBody = method !== 'GET' && method !== 'DELETE' && body?.trim();
	if (hasBody) headers['Content-Type'] = 'application/json';
	if (token) headers.Authorization = `Bearer ${token}`;

	const started = performance.now();
	try {
		const res = await fetch(url, {
			method,
			headers,
			body: hasBody ? body : undefined,
		});
		const text = await res.text();
		let data = text;
		try {
			data = text ? JSON.parse(text) : null;
		} catch {
			// not JSON — keep the raw text
		}
		return {
			ok: res.ok,
			status: res.status,
			statusText: res.statusText,
			ms: Math.round(performance.now() - started),
			size: new Blob([text]).size,
			data,
		};
	} catch (error) {
		return {
			ok: false,
			status: 0,
			statusText: 'Network error',
			ms: Math.round(performance.now() - started),
			size: 0,
			data: { error: error.message },
		};
	}
};

// '2xx' → success tone, etc. — for the StatusBadge
export const statusTone = (status) => {
	if (status >= 200 && status < 300) return 'success';
	if (status >= 300 && status < 400) return 'info';
	if (status >= 400 && status < 500) return 'warning';
	return 'error';
};
