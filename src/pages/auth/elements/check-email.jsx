import React from 'react';
import PropTypes from 'prop-types';
import { LuMailCheck, LuSend } from 'react-icons/lu';
import AuthServices from '../../../features/services/custom-hooks/auth';
import { AppButton } from '../../../components/button';
import AuthHeader from './auth-header';
import { AuthNotice } from './index.style';

// An account can't sign in until its email is verified, so register and
// login both end here: what to do next, plus a new link if the first one
// never arrived. children = the way back (a sign-in link, a back button).
function CheckEmail({ email, title, text, children }) {
	const resend = AuthServices.resendVerification();

	return (
		<AuthNotice>
			<span className="sc_icon" aria-hidden="true">
				<LuMailCheck />
			</span>
			<AuthHeader eyebrow="Email verification" title={title} subtitle={text} />
			<AppButton
				variant="secondary"
				icon={<LuSend />}
				disabled={resend.isPending || resend.isSuccess}
				onClick={() => resend.mutate({ email })}
				className="w-full"
			>
				{resend.isSuccess
					? 'Sent — check your inbox'
					: resend.isPending
						? 'Sending…'
						: 'Send a new link'}
			</AppButton>
			{children}
		</AuthNotice>
	);
}

CheckEmail.propTypes = {
	email: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	text: PropTypes.node.isRequired,
	children: PropTypes.node,
};

export default CheckEmail;
