import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { axiosCall } from '../index-client';
import { setSession, logout } from '../../../store/slice/auth';

// polygrid-backend src/routes/userRoutes.ts. Register and login both
// answer with toPublicUser() + token, which setSession stores.

// POST /api/users  { fullName, email, password, phoneNumber? }
const useRegisterMutation = () => {
	const dispatch = useDispatch();
	return useMutation({
		mutationFn: (data) =>
			axiosCall({ url: '/api/users', method: 'POST', data }),
		onSuccess: (res) => dispatch(setSession(res)),
	});
};

// POST /api/users/login  { email, password, token? }
// If the account has 2FA, the first attempt fails with code 2FA_REQUIRED
// (no toast — error.is2FARequired) and the page asks for the 6-digit code;
// a wrong code fails with 2FA_INVALID.
const useLoginMutation = () => {
	const dispatch = useDispatch();
	return useMutation({
		mutationFn: (data) =>
			axiosCall({ url: '/api/users/login', method: 'POST', data }),
		onSuccess: (res) => dispatch(setSession(res)),
	});
};

// POST /api/users/request-reset  { email } — always answers with the same
// generic message, whether or not the account exists.
const useRequestResetMutation = () =>
	useMutation({
		mutationFn: (data) =>
			axiosCall({ url: '/api/users/request-reset', method: 'POST', data }),
	});

// POST /api/users/reset-password  { token, password } — token comes from
// the emailed link: /reset-password/:token
const useResetPasswordMutation = () =>
	useMutation({
		mutationFn: (data) =>
			axiosCall({ url: '/api/users/reset-password', method: 'POST', data }),
	});

// Clears the session and every cached query (another user's data must
// never show after logout).
const useLogout = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	return () => {
		dispatch(logout());
		queryClient.clear();
	};
};

const AuthServices = {
	register: useRegisterMutation,
	login: useLoginMutation,
	requestReset: useRequestResetMutation,
	resetPassword: useResetPasswordMutation,
	logout: useLogout,
};

export default AuthServices;
