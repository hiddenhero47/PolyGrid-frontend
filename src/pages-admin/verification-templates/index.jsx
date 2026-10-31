import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import {
	LuChevronDown,
	LuCloudOff,
	LuCopyPlus,
	LuFileText,
	LuInbox,
	LuPlus,
	LuRotateCw,
} from 'react-icons/lu';
import AdminModerationServices from '../../features/services/custom-hooks/admin-moderation';
import ReferenceServices from '../../features/services/custom-hooks/reference';
import PageHeader from '../../layouts/dashboard-shell/sub-components/page-header';
import { toast } from '../../layouts/toast/toast-handler';
import EmptyState from '../../components/empty-state';
import StatusBadge from '../../components/status-badge';
import SegmentedControl from '../../components/segmented-control';
import { AppButton } from '../../components/button';
import { CustomSelect } from '../../components/form-components';
import { SkeletonBar } from '../../components/table/index.style';
import { Chip } from '../../pages/home/elements/index.style';
import { ReviewCard } from '../verifications/elements/index.style';
import { PROFILE_TYPE, PROFILE_TYPE_LABELS } from '../../utilities/app-const';
import {
	countryName,
	enumToOptions,
	formatDate,
} from '../../utilities/basic-functions';
import TemplateFormModal from './elements/template-form-modal';
import { FIELD_TYPE_LABELS } from './elements/template-schema';

const PROFILE_OPTIONS = enumToOptions(PROFILE_TYPE, PROFILE_TYPE_LABELS);
const plural = (n = 0, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const SHOW = [
	{ value: 'true', label: 'Live' },
	{ value: '', label: 'All versions' },
	{ value: 'false', label: 'Retired' },
];

// What a template asks for, folded away until needed.
function TemplateDetails({ template }) {
	return (
		<details className="group rounded-xl border border-(--pg-card-border)">
			<summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-(--pg-text-primary)">
				{plural(template.fields?.length, 'field')} ·{' '}
				{plural(template.documents?.length, 'document')}
				<LuChevronDown
					aria-hidden="true"
					className="transition-transform group-open:rotate-180"
				/>
			</summary>
			<div className="grid gap-5 border-t border-(--pg-card-border) p-4 sm:grid-cols-2">
				<div>
					<p className="font-label mb-2 text-[10.5px] font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
						Fields
					</p>
					<ul className="flex flex-col gap-1.5 text-sm">
						{template.fields?.map((f) => (
							<li key={f.key} className="text-(--pg-text-primary)">
								{f.label}
								<span className="text-(--pg-text-secondary)">
									{' '}
									· {FIELD_TYPE_LABELS[f.type] || f.type}
									{f.required ? '' : ' · optional'}
									{f.options?.length ? ` · ${f.options.join(' / ')}` : ''}
								</span>
							</li>
						))}
					</ul>
				</div>
				<div>
					<p className="font-label mb-2 text-[10.5px] font-semibold tracking-[0.14em] text-(--pg-text-secondary) uppercase">
						Documents
					</p>
					{template.documents?.length ? (
						<ul className="flex flex-col gap-1.5 text-sm">
							{template.documents.map((d) => (
								<li
									key={d.type}
									className="inline-flex items-start gap-1.5 text-(--pg-text-primary)"
								>
									<LuFileText
										aria-hidden="true"
										className="mt-0.5 shrink-0 text-(--pg-text-secondary)"
									/>
									<span>
										{d.label}
										<span className="text-(--pg-text-secondary)">
											{' '}
											· {d.acceptedFormats?.join(', ').toUpperCase()}
											{d.required ? '' : ' · optional'}
										</span>
									</span>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-(--pg-text-secondary)">None</p>
					)}
				</div>
			</div>
		</details>
	);
}

TemplateDetails.propTypes = { template: PropTypes.object.isRequired };

// frontend-plan §C.5 — Verification templates (admin / super_admin): what
// each profile type must fill in and upload to be verified, per country
// (or state). Templates are versioned — publishing one retires the live
// version for the same combination; there's no edit. "New version" starts
// from an existing one. URL: ?profileType=&country=&show=true|false|''
function VerificationTemplates() {
	const [params, setParams] = useSearchParams();
	const profileType = params.get('profileType') || '';
	const country = params.get('country') || '';
	const show = params.has('show') ? params.get('show') : 'true';
	const templates = AdminModerationServices.templates({
		profileType,
		country,
		isActive: show,
	});
	const all = AdminModerationServices.templates({}); // what's live, for the form's warning
	const create = AdminModerationServices.createTemplate();
	const { data: countries = [] } = ReferenceServices.getCountries();
	const formRef = useRef(null);
	const [base, setBase] = useState(null);
	const rows = templates.data?.data || [];

	const update = (changes) => {
		const next = new URLSearchParams(params);
		Object.entries(changes).forEach(([k, v]) => {
			if (k === 'show') {
				if (v === 'true') next.delete('show');
				else next.set('show', v);
			} else if (v) next.set(k, v);
			else next.delete(k);
		});
		setParams(next);
	};

	const openForm = (template) => {
		setBase(template);
		formRef.current.open();
	};

	return (
		<>
			<PageHeader
				eyebrow="Review queues"
				title="Verification templates"
				subtitle="What each kind of profile fills in and uploads to get verified, country by country. Publishing a new version replaces the live one — nothing is edited in place."
				actions={
					<AppButton icon={<LuPlus />} onClick={() => openForm(null)}>
						New template
					</AppButton>
				}
			/>

			<div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end">
				<SegmentedControl
					label="Show"
					options={SHOW}
					value={show}
					onChange={(v) => update({ show: v })}
				/>
				<div className="grid flex-1 gap-4 sm:grid-cols-2 lg:max-w-160">
					<CustomSelect
						id="tpl-type"
						label="Profile type"
						placeholder="Any"
						variant="outline"
						clearable
						options={PROFILE_OPTIONS}
						value={profileType}
						onChange={(v) => update({ profileType: v })}
					/>
					<CustomSelect
						id="tpl-country"
						label="Country"
						placeholder="Any"
						variant="outline"
						clearable
						options={countries.map((c) => ({
							value: c.isoCode,
							label: c.name,
						}))}
						value={country}
						onChange={(v) => update({ country: v })}
					/>
				</div>
			</div>

			{templates.isPending ? (
				<div className="flex flex-col gap-4">
					{Array.from({ length: 3 }, (_, i) => (
						<SkeletonBar
							key={i}
							$width="100%"
							style={{ height: 120, borderRadius: 18 }}
						/>
					))}
				</div>
			) : templates.isError ? (
				<EmptyState
					tone="error"
					icon={<LuCloudOff />}
					title="Couldn’t load templates"
					actions={
						<AppButton
							icon={<LuRotateCw />}
							onClick={() => templates.refetch()}
						>
							Retry
						</AppButton>
					}
				/>
			) : rows.length === 0 ? (
				<EmptyState
					icon={<LuInbox />}
					title="No templates match"
					text={
						show === 'false'
							? 'Nothing has been retired yet.'
							: 'Without a live template, people of that type in that country can’t submit a verification.'
					}
					actions={
						<AppButton
							variant="secondary"
							icon={<LuPlus />}
							onClick={() => openForm(null)}
						>
							New template
						</AppButton>
					}
				/>
			) : (
				<div
					className="flex flex-col gap-4 transition-opacity"
					style={{ opacity: templates.isFetching ? 0.6 : 1 }}
				>
					{rows.map((t) => (
						<ReviewCard key={t._id} aria-labelledby={`tpl-${t._id}`}>
							<div className="sc_who">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2.5">
										<h3 id={`tpl-${t._id}`} className="sc_name">
											{t.name}
										</h3>
										<Chip $accent>
											{PROFILE_TYPE_LABELS[t.profileType] || t.profileType}
										</Chip>
									</div>
									<div className="sc_meta">
										<span>
											{countryName(t.country)}
											{t.state ? ` · ${t.state}` : ' · whole country'}
										</span>
										<span>Version {t.version}</span>
										<span>Published {formatDate(t.createdAt, true)}</span>
									</div>
								</div>
								<StatusBadge
									label={t.isActive ? 'Live' : 'Retired'}
									tone={t.isActive ? 'success' : 'neutral'}
								/>
							</div>
							<TemplateDetails template={t} />
							<div>
								<AppButton
									variant="secondary"
									icon={<LuCopyPlus />}
									onClick={() => openForm(t)}
								>
									{t.isActive ? 'New version' : 'Start a new version from this'}
								</AppButton>
							</div>
						</ReviewCard>
					))}
				</div>
			)}

			<TemplateFormModal
				refName={formRef}
				base={base}
				templates={all.data?.data || []}
				isPending={create.isPending}
				onSubmit={(body) =>
					create.mutate(body, {
						onSuccess: (template) => {
							formRef.current.close();
							toast.success(`“${template.name}” v${template.version} is live`);
						},
					})
				}
			/>
		</>
	);
}

export default VerificationTemplates;
