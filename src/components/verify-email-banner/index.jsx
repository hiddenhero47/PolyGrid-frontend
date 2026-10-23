import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { LuMailWarning, LuX } from 'react-icons/lu';
import AuthServices from '../../features/services/custom-hooks/auth';
import { selectIsAuthenticated } from '../../store/slice/auth';
import { toast } from '../../layouts/toast/toast-handler';

// Thin strip under the navbar for a signed-in user whose email isn't
// verified yet (user.verified === false), with a resend button.
// Dismissing hides it until the next page load.
function VerifyEmailBanner() {
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const { user } = useSelector((state) => state.auth);
	const [dismissed, setDismissed] = useState(false);
	const resend = AuthServices.resendVerification();

	if (!isAuthenticated || user?.verified !== false || dismissed) return null;

	const send = () =>
		resend.mutate(
			{ email: user.email },
			{ onSuccess: () => toast.success(`A new link was sent to ${user.email}`) }
		);

	return (
		<div className="border-b border-(--pg-card-border) bg-(--pg-status-warningSoft)">
			<div className="mx-auto flex w-full max-w-360 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-[15px] text-(--pg-text-primary) md:px-8 xl:px-12">
				<LuMailWarning
					className="shrink-0 text-lg text-(--pg-status-warning)"
					aria-hidden="true"
				/>
				<p className="min-w-0 flex-1">
					Please verify your email — we sent a link to{' '}
					<span className="font-semibold">{user.email}</span>.
				</p>
				<button
					type="button"
					onClick={send}
					disabled={resend.isPending || resend.isSuccess}
					className="font-label text-xs font-semibold tracking-[0.12em] text-(--pg-text-link) uppercase hover:underline disabled:text-(--pg-text-secondary) disabled:no-underline"
				>
					{resend.isSuccess
						? 'Sent'
						: resend.isPending
							? 'Sending…'
							: 'Resend email'}
				</button>
				<button
					type="button"
					onClick={() => setDismissed(true)}
					aria-label="Dismiss"
					className="rounded-md p-1 text-(--pg-text-secondary) hover:bg-(--pg-state-hover) hover:text-(--pg-text-primary)"
				>
					<LuX aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}

export default VerifyEmailBanner;
