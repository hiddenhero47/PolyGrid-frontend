import { toast as reactToast } from 'react-toastify';

// The app's single toast entry point — import `toast` from here, never
// from react-toastify directly, so the look can change in one place
// (HM later swapped in a custom toast body the same way).
export const toast = {
	success: (message, options) => reactToast.success(message, options),
	error: (message, options) => reactToast.error(message, options),
	info: (message, options) => reactToast.info(message, options),
	warning: (message, options) => reactToast.warning(message, options),
	dismiss: reactToast.dismiss,
};
