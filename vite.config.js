import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
	plugins: [svgr(), react(), tailwindcss()],
	server: {
		// polygrid-backend's CORS allow-list (corsMiddleware.ts) includes
		// localhost:5173 — keep this port fixed so requests aren't blocked.
		port: 5173,
		strictPort: true,
	},
});
