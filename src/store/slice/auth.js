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
		// register / login responses are the user with `token` mixed in
		setSession: (state, action) => {
			const { token, ...user } = action.payload || {};
			state.user = user;
			state.token = token || '';
		},
		// Handled in store/index.js's rootReducer: resets every slice.
		logout: () => initialState,
	},
});

export const selectIsAuthenticated = (state) =>
	Boolean(state.auth.token) && Boolean(state.auth.user?.id);

export const { setUser, setToken, setSession, logout } = authSlice.actions;
export default authSlice.reducer;
