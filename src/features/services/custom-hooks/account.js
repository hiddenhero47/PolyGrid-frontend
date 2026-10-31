import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { axiosCall } from '../index-client';
import { setUser, logout } from '../../../store/slice/auth';

// Account Settings (frontend-plan §B.2) — polygrid-backend userRoutes.ts.
// Changes to the user are written straight into the auth slice, so the
// navbar / dashboard pick them up without a refetch.

const useMergeUser = () => {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.auth);
	return (changes) => dispatch(setUser({ ...user, ...changes }));
};

// PUT /api/users/profile — { fullName?, phoneNumber? } and/or an avatar
// image. With an avatar it's multipart (`data` JSON + the file).
// Answers { message, user, avatarWarnings? }.
const useUpdateProfileMutation = () => {
	const merge = useMergeUser();
	return useMutation({
		mutationFn: ({ fields = {}, avatar }) => {
			if (!avatar)
				return axiosCall({
					url: '/api/users/profile',
					method: 'PUT',
					data: fields,
				});
			const body = new FormData();
			body.append('data', JSON.stringify(fields));
			body.append('avatar', avatar);
			return axiosCall({
				url: '/api/users/profile',
				method: 'PUT',
				data: body,
			});
		},
		onSuccess: (res) => merge(res.user),
	});
};

// PUT /api/users/profile { oldPassword, password }. The backend rotates
// the session id on a password change, so every token (this one too)
// stops working: end the session here and sign in again.
const useChangePasswordMutation = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ oldPassword, password }) =>
			axiosCall({
				url: '/api/users/profile',
				method: 'PUT',
				data: { oldPassword, password },
			}),
		onSuccess: () => {
			dispatch(logout());
			queryClient.clear();
		},
	});
};

// PATCH /api/users/account-type { activeAccountType: 'normal' | 'business' }
const useSetAccountTypeMutation = () => {
	const merge = useMergeUser();
	return useMutation({
		mutationFn: (activeAccountType) =>
			axiosCall({
				url: '/api/users/account-type',
				method: 'PATCH',
				data: { activeAccountType },
			}),
		onSuccess: (res) => merge({ activeAccountType: res.activeAccountType }),
	});
};

// The routes below sit behind verifyIdentity: send `currentPassword`, or
// `otpToken` when 2FA is on (ConfirmIdentityModal collects whichever).

// PUT /api/users/payout-account { accountName, accountNumber, bankName,
// bankCode?, country, ...identity } → { payoutAccount }
const useUpdatePayoutMutation = () => {
	const merge = useMergeUser();
	return useMutation({
		mutationFn: (data) =>
			axiosCall({ url: '/api/users/payout-account', method: 'PUT', data }),
		onSuccess: (res) => merge({ payoutAccount: res.payoutAccount }),
	});
};

// POST /api/users/2fa/setup { ...identity } → { tempSecret, otpauth,
// qrCodeDataURL }. Nothing is enabled until verify succeeds.
const useSetupTwoFactorMutation = () =>
	useMutation({
		mutationFn: (identity) =>
			axiosCall({
				url: '/api/users/2fa/setup',
				method: 'POST',
				data: identity,
			}),
	});

// POST /api/users/2fa/verify { token } — the first code from the app;
// turns 2FA on.
const useVerifyTwoFactorMutation = () => {
	const merge = useMergeUser();
	return useMutation({
		mutationFn: (token) =>
			axiosCall({
				url: '/api/users/2fa/verify',
				method: 'POST',
				data: { token },
			}),
		onSuccess: (res) => merge({ user2fa: res.user2fa }),
	});
};

// PUT /api/users/2fa/toggle { enable, ...identity }
const useToggleTwoFactorMutation = () => {
	const merge = useMergeUser();
	return useMutation({
		mutationFn: ({ enable, ...identity }) =>
			axiosCall({
				url: '/api/users/2fa/toggle',
				method: 'PUT',
				data: { enable, ...identity },
			}),
		onSuccess: (res) => merge({ user2fa: res.user2fa }),
	});
};

// PATCH /api/users/invalidate — every issued token stops working,
// including this one, so the session ends here too.
const useLogoutEverywhereMutation = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			axiosCall({ url: '/api/users/invalidate', method: 'PATCH' }),
		onSuccess: () => {
			dispatch(logout());
			queryClient.clear();
		},
	});
};

const AccountServices = {
	updateProfile: useUpdateProfileMutation,
	changePassword: useChangePasswordMutation,
	setAccountType: useSetAccountTypeMutation,
	updatePayout: useUpdatePayoutMutation,
	setupTwoFactor: useSetupTwoFactorMutation,
	verifyTwoFactor: useVerifyTwoFactorMutation,
	toggleTwoFactor: useToggleTwoFactorMutation,
	logoutEverywhere: useLogoutEverywhereMutation,
};

export default AccountServices;
