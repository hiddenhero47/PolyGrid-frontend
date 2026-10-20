import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { LuShieldCheck, LuShieldOff, LuCopy } from 'react-icons/lu';
import AccountServices from '../../../../features/services/custom-hooks/account';
import { toast } from '../../../../layouts/toast/toast-handler';
import ConfirmIdentityModal from '../../../../components/modal/confirm-identity-modal';
import StatusBadge from '../../../../components/status-badge';
import { AppButton } from '../../../../components/button';
import { CustomOtp } from '../../../../components/form-components';
import SettingsCard from './settings-card';

// Two-factor authentication: set up (confirm identity → QR code → first
// code turns it on), or turn off (confirm identity with a code).
// POST /2fa/setup · POST /2fa/verify · PUT /2fa/toggle.
function TwoFactorSection() {
	const { user } = useSelector((state) => state.auth);
	const enabled = Boolean(user?.user2fa?.enable);
	const idRef = useRef(null);
	const [setup, setSetup] = useState(null); // { qrCodeDataURL, tempSecret }
	const [code, setCode] = useState('');
	const [codeError, setCodeError] = useState('');

	const start = AccountServices.setupTwoFactor();
	const verify = AccountServices.verifyTwoFactor();
	const toggle = AccountServices.toggleTwoFactor();

	const begin = async () => {
		const identity = await idRef.current.ask({
			action: 'set up two-factor authentication',
		});
		if (!identity) return;
		start.mutate(identity, {
			onSuccess: (res) => {
				setSetup(res);
				setCode('');
			},
		});
	};

	const confirmCode = (value = code) => {
		if (!/^\d{6}$/.test(value)) {
			setCodeError('Enter the 6-digit code');
			return;
		}
		verify.mutate(value, {
			onSuccess: () => {
				setSetup(null);
				toast.success('Two-factor authentication is on');
			},
			onError: () =>
				setCodeError('That code didn’t match — try the newest one'),
		});
	};

	const turnOff = async () => {
		const identity = await idRef.current.ask({
			action: 'turn off two-factor authentication',
		});
		if (!identity) return;
		toggle.mutate(
			{ enable: false, ...identity },
			{ onSuccess: () => toast.success('Two-factor authentication is off') }
		);
	};

	return (
		<SettingsCard
			id="two-factor-settings"
			title="Two-factor authentication"
			description="Sign-ins and sensitive changes also ask for a code from an authenticator app (Google Authenticator, 1Password, Authy…)."
		>
			<div className="flex flex-col gap-5">
				<div className="flex flex-wrap items-center gap-3">
					<StatusBadge
						label={enabled ? 'On' : 'Off'}
						tone={enabled ? 'success' : 'neutral'}
					/>
					{enabled ? (
						<AppButton
							variant="secondary"
							icon={<LuShieldOff />}
							onClick={turnOff}
							disabled={toggle.isPending}
						>
							Turn off
						</AppButton>
					) : (
						!setup && (
							<AppButton
								icon={<LuShieldCheck />}
								onClick={begin}
								disabled={start.isPending}
							>
								{start.isPending ? 'Preparing…' : 'Set up'}
							</AppButton>
						)
					)}
				</div>

				{setup && !enabled && (
					<div className="flex flex-col gap-5 rounded-2xl border border-(--pg-card-border) bg-(--pg-surface-background) p-5 sm:flex-row">
						<img
							src={setup.qrCodeDataURL}
							alt="QR code for your authenticator app"
							width="168"
							height="168"
							className="shrink-0 self-start rounded-xl bg-white p-2"
						/>
						<div className="flex min-w-0 flex-col gap-4">
							<ol className="list-decimal space-y-1.5 pl-5 text-[14.5px] text-(--pg-text-secondary)">
								<li>Scan the QR code with your authenticator app.</li>
								<li>
									Can’t scan? Enter this key:{' '}
									<button
										type="button"
										onClick={() =>
											navigator.clipboard
												?.writeText(setup.tempSecret)
												.then(() => toast.info('Key copied'))
										}
										className="inline-flex items-center gap-1 font-mono text-[13px] break-all text-(--pg-text-primary) hover:underline"
									>
										{setup.tempSecret} <LuCopy aria-hidden="true" />
									</button>
								</li>
								<li>Type the 6-digit code it shows.</li>
							</ol>
							<CustomOtp
								label="Code from the app"
								name="code"
								value={code}
								onChange={(next) => {
									setCode(next);
									setCodeError('');
								}}
								onComplete={confirmCode}
								isError={Boolean(codeError)}
								errormessage={codeError}
							/>
							<div className="flex flex-wrap gap-3">
								<AppButton
									onClick={() => confirmCode()}
									disabled={verify.isPending}
								>
									{verify.isPending ? 'Checking…' : 'Turn on'}
								</AppButton>
								<AppButton variant="secondary" onClick={() => setSetup(null)}>
									Cancel
								</AppButton>
							</div>
						</div>
					</div>
				)}
			</div>
			<ConfirmIdentityModal refName={idRef} />
		</SettingsCard>
	);
}

export default TwoFactorSection;
