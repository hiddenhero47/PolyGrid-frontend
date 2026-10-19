import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/index';
import App from './App.jsx';
// Self-hosted fonts (from the Stitch design): Oswald for display headings,
// Hanken Grotesk for body text, Space Grotesk for small uppercase labels.
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/600.css';
import '@fontsource/oswald/700.css';
import '@fontsource-variable/hanken-grotesk';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import './index.css';

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	</React.StrictMode>
);
