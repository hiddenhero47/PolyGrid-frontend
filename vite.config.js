import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [svgr(), react(), tailwindcss()],
		server: {
			port: 5009,
			strictPort: true,
			// polygrid-backend's CORS allow-list (corsMiddleware.ts) doesn't
			// include :5174, so in development the browser calls /api on this
			// same origin and Vite forwards it to the backend — no CORS
			// involved. index-client.js uses relative URLs in dev for this.
			proxy: {
				'/api': {
					target: env.VITE_API_URL || 'http://localhost:4000',
					changeOrigin: true,
				},
			},
		},
	};
});
