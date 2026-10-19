import { createElement } from 'react';
import { toast as reactToast } from 'react-toastify';
import CustomToast from './components/custom-toast';

// The app's single toast entry point — import `toast` from here, never
// from react-toastify directly. Same calls as before:
//   toast.success('Saved')
//   toast.error(message, { title: 'Upload failed', actionText: 'Retry', onAction })
// react-toastify handles placement and timing; CustomToast is the look.
const createToast =
	(type) =>
	(message, { title, actionText, onAction, ...options } = {}) =>
		reactToast(
			({ closeToast }) =>
				createElement(CustomToast, {
					type,
					title,
					message,
					actionText,
					onAction,
					closeToast,
				}),
			{ closeButton: false, icon: false, ...options }
		);

export const toast = {
	success: createToast('success'),
	error: createToast('error'),
	info: createToast('info'),
	warning: createToast('warning'),
	dismiss: reactToast.dismiss,
};
