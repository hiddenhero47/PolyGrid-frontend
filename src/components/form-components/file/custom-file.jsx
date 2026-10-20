import React, { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { LuUpload, LuFileText, LuX } from 'react-icons/lu';
import FormField from '../field';
import { fieldAria } from '../helpers';
import { DropZone, FileRow } from './index.style';

const MB = 1024 * 1024;

const formatBytes = (bytes = 0) =>
	bytes < MB
		? `${Math.max(1, Math.round(bytes / 1024))} KB`
		: `${(bytes / MB).toFixed(1)} MB`;

// Object URLs for image previews, made once per File and released when
// the file is removed — computed in render, no effect needed.
const previews = new WeakMap();
const previewUrl = (file) => {
	if (!previews.has(file)) previews.set(file, URL.createObjectURL(file));
	return previews.get(file);
};
const releasePreview = (file) => {
	if (previews.has(file)) {
		URL.revokeObjectURL(previews.get(file));
		previews.delete(file);
	}
};

// 'image/jpeg,image/png,.pdf' → does this file match?
const matchesAccept = (file, accept) => {
	if (!accept) return true;
	const name = file.name.toLowerCase();
	return accept
		.split(',')
		.map((rule) => rule.trim().toLowerCase())
		.some((rule) =>
			rule.startsWith('.')
				? name.endsWith(rule)
				: rule.endsWith('/*')
					? file.type.startsWith(rule.slice(0, -1))
					: file.type === rule
		);
};

// frontend-plan §2's file upload widget (both flavors — public image or
// private document; the caller decides where the files go). A native
// <input type="file"> inside a <label> drop zone: click, keyboard and
// drag-and-drop all work, nothing uploads until the form submits.
//
// Value: File[] when `multiple`, else File | null. onChange gets the new
// value. Files of the wrong type / too big are skipped with an inline
// note (the backend checks again).
function CustomFile({
	value,
	onChange,
	multiple = false,
	maxFiles,
	maxSize = 10 * MB,
	accept,
	acceptLabel,
	name,
	id,
	label,
	hint,
	required = false,
	isError = false,
	errormessage,
	disabled = false,
	compact = false,
	variant = 'filled',
	className,
}) {
	const autoId = useId();
	const inputId = id || autoId;
	const [dragging, setDragging] = useState(false);
	const [skipped, setSkipped] = useState('');

	const files = multiple ? value || [] : value ? [value] : [];
	const limit = multiple ? maxFiles : 1;
	const full = limit ? files.length >= limit : false;

	const addFiles = (incoming) => {
		const notes = [];
		const accepted = [];
		Array.from(incoming).forEach((file) => {
			if (!matchesAccept(file, accept))
				notes.push(`${file.name}: wrong file type`);
			else if (file.size > maxSize)
				notes.push(`${file.name}: over ${formatBytes(maxSize)}`);
			else accepted.push(file);
		});

		let next = multiple ? [...files, ...accepted] : accepted.slice(-1);
		if (multiple && limit && next.length > limit) {
			notes.push(`Only ${limit} file${limit === 1 ? '' : 's'} allowed`);
			next = next.slice(0, limit);
		}
		if (!multiple) files.forEach(releasePreview);
		setSkipped(notes.join(' · '));
		if (accepted.length) onChange?.(multiple ? next : next[0] || null);
	};

	const remove = (file) => {
		releasePreview(file);
		setSkipped('');
		onChange?.(multiple ? files.filter((f) => f !== file) : null);
	};

	const meta = [
		acceptLabel,
		`up to ${formatBytes(maxSize)}${multiple ? ' each' : ''}`,
		multiple && limit ? `max ${limit} files` : null,
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<FormField
			id={inputId}
			label={label}
			hint={skipped || hint}
			required={required}
			isError={isError}
			errormessage={errormessage}
			className={className}
		>
			{!(full && !multiple && files.length) && (
				<DropZone
					$dragging={dragging}
					$isError={Boolean(isError)}
					$disabled={disabled || full}
					$compact={compact}
					$variant={variant}
					onDragOver={(e) => {
						e.preventDefault();
						if (!disabled && !full) setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={(e) => {
						e.preventDefault();
						setDragging(false);
						if (!disabled && !full) addFiles(e.dataTransfer.files);
					}}
				>
					<input
						type="file"
						id={inputId}
						name={name}
						accept={accept}
						multiple={multiple}
						disabled={disabled || full}
						required={required && !files.length}
						onChange={(e) => {
							addFiles(e.target.files);
							e.target.value = ''; // same file can be picked again
						}}
						{...fieldAria({
							id: inputId,
							hint: skipped || hint,
							isError,
							errormessage,
						})}
					/>
					<span className="sc_dropIcon" aria-hidden="true">
						<LuUpload />
					</span>
					<span className="sc_dropTitle">
						{full ? (
							'File limit reached'
						) : (
							<>
								Drop {multiple ? 'files' : 'a file'} here or <span>browse</span>
							</>
						)}
					</span>
					<span className="sc_dropMeta">{meta}</span>
				</DropZone>
			)}

			{files.length > 0 && (
				<ul className="mt-2.5 flex flex-col gap-2">
					{files.map((file) => (
						<FileRow key={`${file.name}-${file.size}-${file.lastModified}`}>
							<span className="sc_thumb" aria-hidden="true">
								{file.type.startsWith('image/') ? (
									<img src={previewUrl(file)} alt="" />
								) : (
									<LuFileText />
								)}
							</span>
							<span className="min-w-0">
								<span className="sc_name">{file.name}</span>
								<span className="sc_size">{formatBytes(file.size)}</span>
							</span>
							<button
								type="button"
								className="sc_remove"
								onClick={() => remove(file)}
								disabled={disabled}
								aria-label={`Remove ${file.name}`}
							>
								<LuX aria-hidden="true" />
							</button>
						</FileRow>
					))}
				</ul>
			)}
		</FormField>
	);
}

CustomFile.propTypes = {
	value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
	onChange: PropTypes.func,
	multiple: PropTypes.bool,
	maxFiles: PropTypes.number,
	maxSize: PropTypes.number,
	accept: PropTypes.string,
	acceptLabel: PropTypes.string,
	name: PropTypes.string,
	id: PropTypes.string,
	label: PropTypes.node,
	hint: PropTypes.node,
	required: PropTypes.bool,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	disabled: PropTypes.bool,
	compact: PropTypes.bool,
	variant: PropTypes.oneOf(['filled', 'outline']),
	className: PropTypes.string,
};

export default CustomFile;
