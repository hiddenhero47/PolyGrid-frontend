import { createSlice } from '@reduxjs/toolkit';

// `user` is the backend's toPublicUser() shape (polygrid-backend
// src/controllers/userController.ts); `token` is the JWT returned
// alongside it by register/login/google/apple.
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
		// Handled in store/index.js's rootReducer: resets every slice.
		logout: () => initialState,
	},
});

export const selectIsAuthenticated = (state) =>
	Boolean(state.auth.token) && Boolean(state.auth.user?._id);

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
