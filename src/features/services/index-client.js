import axios from 'axios';
import { store } from '../../store/index';
import { logout } from '../../store/slice/auth';
import { toast } from '../../layouts/toast/toast-handler';

// polygrid-backend error shape (src/middleware/errorMiddleware.ts):
//   { message, code?, data? }
// A yup validation failure (src/validators/validate.ts) is a 400 whose
// `message` is every failing field's message joined with ", ".

// In development, requests stay on this origin (/api/...) and Vite's dev
// proxy forwards them to VITE_API_URL — see vite.config.js. A production
// build calls VITE_API_URL directly.
const BASE_URL = import.meta.env.DEV
	? ''
	: import.meta.env.VITE_API_URL?.trim();

// Codes the caller handles itself — no generic error toast.
// 2FA_REQUIRED / 2FA_INVALID come from userController's enforceTwoFactor:
// the login form shows a code prompt instead.
const SILENT_CODES = ['2FA_REQUIRED', '2FA_INVALID'];

export const getErrorMessage = (error) =>
	error?.response?.data?.message ||
	error?.message ||
	'Something went wrong. Please try again.';

// baseURL does what HM's request interceptor did by hand:
//   axiosCall({ url: '/api/users/login' })      → BASE_URL + /api/users/login
//   axiosCall({ url: 'https://other.server/x' }) → used as-is, BASE_URL skipped
// Slashes are joined correctly either way, so VITE_API_URL needs no
// trailing slash.
const axiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 60000,
});

// The token only goes to our own backend — never to a third-party URL
// (Cloudinary, etc.), which would otherwise receive a working login token.
const isOurApi = (url = '') =>
	!/^https?:\/\//i.test(url) || (BASE_URL && url.startsWith(BASE_URL));

axiosInstance.interceptors.request.use((req) => {
	const { token } = store.getState().auth;
	if (token && isOurApi(req.url)) {
		req.headers.Authorization = `Bearer ${token}`;
	}
	return req;
});

axiosInstance.interceptors.response.use(
	(res) => res,
	(error) => {
		const status = error.response?.status;
		const code = error.response?.data?.code;

		if (SILENT_CODES.includes(code)) {
			error.is2FARequired = true;
			error.twoFactorCode = code; // '2FA_REQUIRED' | '2FA_INVALID'
			return Promise.reject(error);
		}

		// Expired/invalid session — drop it rather than leave the app
		// sending a dead token on every request.
		if (status === 401 && store.getState().auth.token) {
			store.dispatch(logout());
		}

		// Per-request opt-out: axiosCall({ ..., silent: true })
		if (!error.config?.silent) {
			toast.error(getErrorMessage(error));
		}
		return Promise.reject(error);
	}
);

// Returns only the response body. `silent: true` skips the error toast
// (e.g. a 404 that just means "nothing yet", not a failure).
export const axiosCall = async ({ url, method, data, params, silent }) => {
	if (!url || !method) throw new Error('axiosCall: url and method required');
	const response = await axiosInstance({ url, method, data, params, silent });
	return response.data;
};

export default axiosInstance;
