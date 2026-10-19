import React from 'react';
import PropTypes from 'prop-types';
import { LuCopy } from 'react-icons/lu';
import StatusBadge from '../../../components/status-badge';
import { toast } from '../../../layouts/toast/toast-handler';
import { CodeBlock } from '../../lab/elements/index.style';
import { statusTone } from './request';

// Status + timing line, then the body as formatted JSON.
function ResponseView({ response }) {
	if (!response) return null;
	const pretty =
		typeof response.data === 'string'
			? response.data
			: JSON.stringify(response.data, null, 2);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(pretty);
			toast.success('Response copied');
		} catch {
			toast.error('Copy failed');
		}
	};

	return (
		<div className="flex min-w-0 flex-col gap-3">
			<div className="flex flex-wrap items-center gap-3 text-sm text-(--pg-text-secondary)">
				<StatusBadge
					label={`${response.status || '—'} ${response.statusText || ''}`.trim()}
					tone={statusTone(response.status)}
				/>
				<span className="tabular-nums">{response.ms} ms</span>
				<span className="tabular-nums">
					{(response.size / 1024).toFixed(1)} KB
				</span>
				<button
					type="button"
					onClick={copy}
					className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-(--pg-text-link) hover:bg-(--pg-state-hover)"
				>
					<LuCopy aria-hidden="true" /> Copy
				</button>
			</div>
			<CodeBlock className="max-h-[480px] overflow-y-auto">
				{pretty || '(empty body)'}
			</CodeBlock>
		</div>
	);
}

ResponseView.propTypes = {
	response: PropTypes.shape({
		ok: PropTypes.bool,
		status: PropTypes.number,
		statusText: PropTypes.string,
		ms: PropTypes.number,
		size: PropTypes.number,
		data: PropTypes.any,
	}),
};

export default ResponseView;
