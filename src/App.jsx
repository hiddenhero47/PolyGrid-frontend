import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import GlobalStyleInjector from './global.style';
import ThemeRoot from './layouts/theme-root';
import IndexLayout from './layouts/index-layout/index';
import WrapperLayout from './layouts/wrapper-layout/index';
import AppToast from './layouts/toast/index-toast';
// pages
import Home from './pages/home';
import NotFound from './pages/not-found';
import ThemePreview from './pages/theme-preview';
import Lab from './pages/lab';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeRoot>
				<GlobalStyleInjector />
				<Router>
					<div id="containerBody">
						<Routes>
							{/* Public / Basic View — frontend-plan §A */}
							<Route element={<IndexLayout />}>
								<Route path="/" element={<Home />} />
								{import.meta.env.DEV && (
									<>
										<Route path="/theme-preview" element={<ThemePreview />} />
										<Route path="/lab" element={<Lab />} />
									</>
								)}
							</Route>

							{/* User Dashboard (§B) and Admin (§C) layouts go here */}

							<Route element={<WrapperLayout />}>
								<Route path="*" element={<NotFound />} />
							</Route>
						</Routes>
					</div>
				</Router>
				<AppToast />
			</ThemeRoot>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}

export default App;
