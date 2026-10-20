import { createSlice } from '@reduxjs/toolkit';

// `user` is the backend's toPublicUser() shape (polygrid-backend
// src/controllers/userController.ts) — note its id field is `id`, not
// `_id`; `token` is the JWT returned alongside it by register/login/
// google/apple.
const initialState = {
	user: {},
	token: '',
};

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload;
		},
		setToken: (state, action) => {
			state.token = action.payload;
		},
		// register / login responses are the user with `token` mixed in.
		// Outside production the backend also adds verifyEmailToken /
		// verifyUrl to register — those must never be stored as user data.
		setSession: (state, action) => {
			// eslint-disable-next-line no-unused-vars
			const { token, verifyEmailToken, verifyUrl, ...user } =
				action.payload || {};
			state.user = user;
			state.token = token || '';
		},
		markEmailVerified: (state) => {
			if (state.user?.id) state.user.verified = true;
		},
		// Handled in store/index.js's rootReducer: resets every slice.
		logout: () => initialState,
	},
});

export const selectIsAuthenticated = (state) =>
	Boolean(state.auth.token) && Boolean(state.auth.user?.id);

export const { setUser, setToken, setSession, markEmailVerified, logout } =
	authSlice.actions;
export default authSlice.reducer;
