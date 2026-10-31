import React, { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import GlobalStyleInjector from './global.style';
import ThemeRoot from './layouts/theme-root';
import IndexLayout from './layouts/index-layout/index';
import WrapperLayout from './layouts/wrapper-layout/index';
import AuthLayout from './layouts/auth-layout';
import AdminLayout from './layouts/admin-layout';
import DashboardLayout from './layouts/dashboard-layout';
import AppToast from './layouts/toast/index-toast';
import RealtimeBridge from './layouts/realtime-bridge';
import { PROFILE_TYPE } from './utilities/app-const';
// pages
import Home from './pages/home';
import BrowseConsultants from './pages/engineering';
import ConsultantProfile from './pages/engineering/profile';
import BoardTeaser from './pages/board-teaser';
import BrowseStores from './pages/store';
import StorePage from './pages/store/shop';
import ProductPage from './pages/store/product';
import DigitalFeed from './pages/store/digital';
import CreatorPage from './pages/store/creator';
import DigitalProductPage from './pages/store/digital-product';
import ClientProfile from './pages/clients/profile';
import BrowseDirectory from './pages/directory';
import DirectoryProfile from './pages/directory/profile';
import NotFound from './pages/not-found';
import Register from './pages/auth/register';
import Login from './pages/auth/login';
import ForgotPassword from './pages/auth/forgot-password';
import ResetPassword from './pages/auth/reset-password';
import VerifyEmail from './pages/auth/verify-email';
import DashboardHome from './pages-dashboard/home';
import MyProfiles from './pages-dashboard/profiles';
import ProfileEditor from './pages-dashboard/profiles/editor';
import VerificationCenter from './pages-dashboard/verification';
import MySubscription from './pages-dashboard/subscription';
import AccountSettings from './pages-dashboard/settings';
import Notifications from './pages-dashboard/notifications';
import MyJobs from './pages-dashboard/jobs';
import NewJob from './pages-dashboard/jobs/new';
import JobDetail from './pages-dashboard/jobs/detail';
import Tenders from './pages-dashboard/tenders';
import NewTenderProject from './pages-dashboard/tenders/new';
import TenderProjectDetail from './pages-dashboard/tenders/detail';
import SiteForce from './pages-dashboard/siteforce';
import NewJobOpening from './pages-dashboard/siteforce/new';
import JobOpeningDetail from './pages-dashboard/siteforce/detail';
import Orders from './pages-dashboard/orders';
import Checkout from './pages-dashboard/orders/checkout';
import Purchases from './pages-dashboard/purchases';
import Messages from './pages-dashboard/messages';
import Contacts from './pages-dashboard/contacts';
import AdminHome from './pages-admin/home';
import AdminVerifications from './pages-admin/verifications';
import AdminPlans from './pages-admin/plans';
import AdminSubscriptions from './pages-admin/subscriptions';
import AdminUsers from './pages-admin/users';
import DigitalReview from './pages-admin/digital-review';
import AdminDisputes from './pages-admin/disputes';
import RefundsPayouts from './pages-admin/refunds-payouts';
import PaymentsLedger from './pages-admin/payments';
import AdminJobs from './pages-admin/jobs';
import VerificationTemplates from './pages-admin/verification-templates';
import MessageReports from './pages-admin/message-reports';
import Moderation from './pages-admin/moderation';

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
					<RealtimeBridge />
					<div id="containerBody">
						<Routes>
							{/* Public / Basic View — frontend-plan §A */}
							<Route element={<IndexLayout />}>
								<Route path="/" element={<Home />} />
								<Route path="/engineering" element={<BrowseConsultants />} />
								<Route
									path="/engineering/:idOrSlug"
									element={<ConsultantProfile />}
								/>
								<Route
									path="/tenders"
									element={<BoardTeaser key="tenders" board="tenders" />}
								/>
								<Route
									path="/contractors"
									element={
										<BrowseDirectory key="contractor" kind="contractor" />
									}
								/>
								<Route
									path="/contractors/:idOrSlug"
									element={
										<DirectoryProfile key="contractor" kind="contractor" />
									}
								/>
								<Route path="/store" element={<BrowseStores />} />
								<Route path="/store/shops/:idOrSlug" element={<StorePage />} />
								<Route path="/store/products/:id" element={<ProductPage />} />
								<Route path="/store/digital" element={<DigitalFeed />} />
								<Route
									path="/store/digital/:id"
									element={<DigitalProductPage />}
								/>
								<Route
									path="/store/creators/:idOrSlug"
									element={<CreatorPage />}
								/>
								<Route path="/clients/:id" element={<ClientProfile />} />
								<Route
									path="/siteforce"
									element={<BoardTeaser key="siteforce" board="siteforce" />}
								/>
								<Route
									path="/siteforce/workers"
									element={<BrowseDirectory key="worker" kind="worker" />}
								/>
								<Route
									path="/siteforce/workers/:idOrSlug"
									element={<DirectoryProfile key="worker" kind="worker" />}
								/>
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
								<Route path="/verify-email/:token" element={<VerifyEmail />} />
							</Route>

							{/* Admin Dashboard — frontend-plan §C (staff roles only) */}
							<Route path="/admin" element={<AdminLayout />}>
								<Route index element={<AdminHome />} />
								<Route path="verifications" element={<AdminVerifications />} />
								<Route path="plans" element={<AdminPlans />} />
								<Route path="subscriptions" element={<AdminSubscriptions />} />
								<Route path="users" element={<AdminUsers />} />
								<Route path="disputes" element={<AdminDisputes />} />
								<Route path="refunds-payouts" element={<RefundsPayouts />} />
								<Route path="payments" element={<PaymentsLedger />} />
								<Route path="jobs" element={<AdminJobs />} />
								<Route
									path="verification-templates"
									element={<VerificationTemplates />}
								/>
								<Route path="message-reports" element={<MessageReports />} />
								<Route path="moderation" element={<Moderation />} />
								<Route path="digital-products" element={<DigitalReview />} />
							</Route>

							{/* User Dashboard — frontend-plan §B (any signed-in account) */}
							<Route path="/dashboard" element={<DashboardLayout />}>
								<Route index element={<DashboardHome />} />
								<Route path="profiles" element={<MyProfiles />} />
								<Route
									path="profiles/consultancy"
									element={
										<ProfileEditor
											key="consultancy"
											profileType={PROFILE_TYPE.CONSULTANCY}
										/>
									}
								/>
								<Route
									path="profiles/contractor"
									element={
										<ProfileEditor
											key="contractor"
											profileType={PROFILE_TYPE.CONTRACTOR}
										/>
									}
								/>
								<Route
									path="profiles/siteforce"
									element={
										<ProfileEditor
											key="labor"
											profileType={PROFILE_TYPE.LABOR}
										/>
									}
								/>
								<Route
									path="profiles/store"
									element={
										<ProfileEditor
											key="store"
											profileType={PROFILE_TYPE.STORE}
										/>
									}
								/>
								<Route
									path="profiles/digital-creator"
									element={
										<ProfileEditor
											key="creator"
											profileType={PROFILE_TYPE.DIGITAL_CREATOR}
										/>
									}
								/>
								<Route
									path="profiles/client"
									element={
										<ProfileEditor
											key="client"
											profileType={PROFILE_TYPE.CLIENT}
										/>
									}
								/>
								<Route path="verification" element={<VerificationCenter />} />
								<Route path="subscription" element={<MySubscription />} />
								<Route path="settings" element={<AccountSettings />} />
								<Route path="notifications" element={<Notifications />} />
								<Route path="jobs" element={<MyJobs />} />
								<Route path="jobs/new" element={<NewJob />} />
								<Route path="jobs/:id" element={<JobDetail />} />
								<Route path="tenders" element={<Tenders />} />
								<Route path="tenders/new" element={<NewTenderProject />} />
								<Route path="tenders/:id" element={<TenderProjectDetail />} />
								<Route path="siteforce" element={<SiteForce />} />
								<Route path="siteforce/new" element={<NewJobOpening />} />
								<Route path="siteforce/:id" element={<JobOpeningDetail />} />
								<Route path="orders" element={<Orders />} />
								<Route path="orders/checkout/:storeId" element={<Checkout />} />
								<Route path="purchases" element={<Purchases />} />
								<Route path="messages" element={<Messages />} />
								<Route path="messages/:id" element={<Messages />} />
								<Route path="contacts" element={<Contacts />} />
							</Route>

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
