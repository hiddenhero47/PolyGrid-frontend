import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { LuSend, LuHistory } from 'react-icons/lu';
import { AppButton } from '../../../components/button';
import {
	CustomInput,
	CustomSelect,
	CustomTextarea,
	CustomToggle,
} from '../../../components/form-components';
import StatusBadge from '../../../components/status-badge';
import { LabSection } from '../../lab/elements/lab-section';
import { sendRequest, statusTone } from './request';
import ResponseView from './response-view';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({
	value: m,
	label: m,
}));

// Handy read-only calls to start from
const PRESETS = [
	{ method: 'GET', path: '/api/reference/countries' },
	{ method: 'GET', path: '/api/users/me' },
	{
		method: 'GET',
		path: '/api/stats/top-profiles?profileType=ConsultancyProfile&limit=5',
	},
	{ method: 'GET', path: '/api/tender-projects/public-summary' },
	{ method: 'GET', path: '/api/job-openings/public-summary' },
	{ method: 'GET', path: '/api/plans' },
];

const HISTORY_SIZE = 12;

function RequestBuilder() {
	const token = useSelector((state) => state.auth.token);
	const [method, setMethod] = useState('GET');
	const [path, setPath] = useState('/api/reference/countries');
	const [body, setBody] = useState('{\n  \n}');
	const [useToken, setUseToken] = useState(true);
	const [bodyError, setBodyError] = useState('');
	const [sending, setSending] = useState(false);
	const [response, setResponse] = useState(null);
	const [history, setHistory] = useState([]);

	const hasBody = method !== 'GET' && method !== 'DELETE';

	const send = async () => {
		if (hasBody && body.trim()) {
			try {
				JSON.parse(body);
			} catch (error) {
				setBodyError(`Body isn't valid JSON — ${error.message}`);
				return;
			}
		}
		setBodyError('');
		setSending(true);
		const res = await sendRequest({
			method,
			path: path.trim(),
			body: hasBody ? body : undefined,
			token: useToken ? token : undefined,
		});
		setResponse(res);
		setHistory((items) =>
			[
				{
					method,
					path: path.trim(),
					body,
					status: res.status,
					ms: res.ms,
					at: Date.now(),
				},
				...items,
			].slice(0, HISTORY_SIZE)
		);
		setSending(false);
	};

	const load = (item) => {
		setMethod(item.method);
		setPath(item.path);
		if (item.body) setBody(item.body);
	};

	return (
		<LabSection
			id="requests"
			title="Request builder"
			note="A tiny Postman. Paths go through the dev proxy to VITE_API_URL. Ctrl/⌘ + Enter sends. Your login token is attached when the switch is on and you're signed in."
		>
			<form
				noValidate
				onSubmit={(e) => {
					e.preventDefault();
					send();
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
						e.preventDefault();
						send();
					}
				}}
				className="flex flex-col gap-5"
			>
				<div className="flex flex-wrap gap-2">
					{PRESETS.map((preset) => (
						<button
							key={preset.path}
							type="button"
							onClick={() => load(preset)}
							className="rounded-md border border-(--pg-chip-border) bg-(--pg-chip-background) px-2.5 py-1.5 font-mono text-xs text-(--pg-chip-text) hover:border-(--pg-border-strong)"
						>
							<span className="font-semibold">{preset.method}</span>{' '}
							{preset.path.split('?')[0]}
						</button>
					))}
				</div>

				<div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-end">
					<CustomSelect
						label="Method"
						options={METHODS}
						value={method}
						onChange={setMethod}
					/>
					<CustomInput
						label="Path"
						placeholder="/api/…"
						value={path}
						onChange={(e) => setPath(e.target.value)}
						className="font-mono"
					/>
					<AppButton
						type="submit"
						icon={<LuSend />}
						disabled={sending || !path.trim()}
					>
						{sending ? 'Sending…' : 'Send'}
					</AppButton>
				</div>

				{hasBody && (
					<CustomTextarea
						label="JSON body"
						value={body}
						onChange={(e) => setBody(e.target.value)}
						minHeight="140px"
						isError={Boolean(bodyError)}
						errormessage={bodyError}
						spellCheck={false}
						className="font-mono"
					/>
				)}

				<CustomToggle
					checked={useToken}
					onChange={(e) => setUseToken(e.target.checked)}
					hint={
						token ? 'You are signed in.' : 'Not signed in — no token to send.'
					}
				>
					Send my login token (Authorization: Bearer …)
				</CustomToggle>
			</form>

			<div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
				<div className="min-w-0">
					{response ? (
						<ResponseView response={response} />
					) : (
						<p className="text-(--pg-text-secondary)">
							Send a request to see the response here.
						</p>
					)}
				</div>

				<aside>
					<p className="font-label mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
						<LuHistory aria-hidden="true" /> History
					</p>
					{history.length === 0 && (
						<p className="text-sm text-(--pg-text-secondary)">
							Nothing sent yet.
						</p>
					)}
					<ul className="flex flex-col gap-1">
						{history.map((item) => (
							<li key={item.at}>
								<button
									type="button"
									onClick={() => load(item)}
									className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-(--pg-state-hover)"
								>
									<StatusBadge
										label={String(item.status || '—')}
										tone={statusTone(item.status)}
									/>
									<span className="font-label text-[11px] font-semibold text-(--pg-text-secondary)">
										{item.method}
									</span>
									<span className="min-w-0 flex-1 truncate font-mono text-xs text-(--pg-text-primary)">
										{item.path}
									</span>
								</button>
							</li>
						))}
					</ul>
				</aside>
			</div>
		</LabSection>
	);
}

export default RequestBuilder;
