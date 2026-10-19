import React, { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import GlobalStyleInjector from './global.style';
import ThemeRoot from './layouts/theme-root';
import IndexLayout from './layouts/index-layout/index';
import WrapperLayout from './layouts/wrapper-layout/index';
import AuthLayout from './layouts/auth-layout';
import AppToast from './layouts/toast/index-toast';
// pages
import Home from './pages/home';
import NotFound from './pages/not-found';
import Register from './pages/auth/register';
import Login from './pages/auth/login';
import ForgotPassword from './pages/auth/forgot-password';
import ResetPassword from './pages/auth/reset-password';

// Development-only pages, loaded lazily so production builds don't
// include them at all. /dev-console is TEMPORARY — delete before launch.
const ThemePreview = import.meta.env.DEV
	? lazy(() => import('./pages/theme-preview'))
	: null;
const Lab = import.meta.env.DEV ? lazy(() => import('./pages/lab')) : null;
const DevConsole = import.meta.env.DEV
	? lazy(() => import('./pages/dev-console'))
	: null;

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
										<Route
											path="/theme-preview"
											element={
												<Suspense fallback={null}>
													<ThemePreview />
												</Suspense>
											}
										/>
										<Route
											path="/lab"
											element={
												<Suspense fallback={null}>
													<Lab />
												</Suspense>
											}
										/>
										<Route
											path="/dev-console"
											element={
												<Suspense fallback={null}>
													<DevConsole />
												</Suspense>
											}
										/>
									</>
								)}
							</Route>

							{/* Register / login / password reset — frontend-plan §A.2–A.4 */}
							<Route element={<AuthLayout />}>
								<Route path="/register" element={<Register />} />
								<Route path="/login" element={<Login />} />
								<Route path="/forgot-password" element={<ForgotPassword />} />
								<Route
									path="/reset-password/:token?"
									element={<ResetPassword />}
								/>
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
