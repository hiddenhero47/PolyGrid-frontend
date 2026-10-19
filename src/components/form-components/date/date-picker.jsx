import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { LuCalendar, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { fieldAria, anchorName, placePopover } from '../helpers';
import { DateTrigger, CalendarPopover } from './index.style';

// PolyGrid's own calendar — the desktop half of CustomDate (touch devices
// get the native picker instead). Same approach as CustomSelect: a native
// `popover`, so click-outside / Escape / top layer / focus-return are the
// browser's job and nothing here is a useEffect.
//
// Focus inside the grid is moved by a ref callback on the focused day:
// React calls it after each render, and it only acts when an open or a
// key press asked for focus (wantFocus).

const FORMAT = 'YYYY-MM-DD';
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// Monday-first, always 6 weeks so the popover never changes height.
const monthGrid = (month) => {
	const start = month.startOf('month');
	const offset = (start.day() + 6) % 7;
	const first = start.subtract(offset, 'day');
	return Array.from({ length: 42 }, (_, i) => first.add(i, 'day'));
};

function DatePicker({
	baseId,
	value,
	onChange,
	onBlur,
	name,
	id,
	min,
	max,
	placeholder = 'Select a date',
	isError,
	errormessage,
	hint,
	required,
	disabled,
	variant,
}) {
	const popoverId = `${baseId}-calendar`;
	const anchor = anchorName('date', baseId);

	const triggerRef = useRef(null);
	const popoverRef = useRef(null);
	const wantFocus = useRef(false);

	const selected = value ? dayjs(value) : null;
	const minDay = min ? dayjs(min) : null;
	const maxDay = max ? dayjs(max) : null;
	const today = dayjs();

	const [open, setOpen] = useState(false);
	const [view, setView] = useState(() => (selected || today).startOf('month'));
	const [focused, setFocused] = useState(() => selected || today);

	const isDisabled = (day) =>
		(minDay && day.isBefore(minDay, 'day')) ||
		(maxDay && day.isAfter(maxDay, 'day'));

	const clamp = (day) => {
		if (minDay && day.isBefore(minDay, 'day')) return minDay;
		if (maxDay && day.isAfter(maxDay, 'day')) return maxDay;
		return day;
	};

	// ── value out: an event-like object, so Formik's handleChange works ──
	const emit = (next) => {
		onChange?.({
			type: 'change',
			target: { name: name || id, id: baseId, type: 'text', value: next },
			persist: () => {},
		});
	};

	const choose = (day) => {
		if (isDisabled(day)) return;
		emit(day.format(FORMAT));
		popoverRef.current?.hidePopover();
		triggerRef.current?.focus();
	};

	const focusDay = (day) => {
		wantFocus.current = true;
		setFocused(day);
		if (!day.isSame(view, 'month')) setView(day.startOf('month'));
	};

	// ref callback on the focused day button — see note at the top
	const focusRef = (el) => {
		if (el && wantFocus.current) {
			wantFocus.current = false;
			el.focus({ preventScroll: true });
		}
	};

	// ── popover events ──
	const handleBeforeToggle = (e) => {
		if (e.newState !== 'open') return;
		placePopover(triggerRef.current, popoverRef.current, {
			matchWidth: false,
			needs: 400,
		});
		// open on the chosen date, or today (kept inside min/max)
		const start = selected || clamp(today);
		setView(start.startOf('month'));
		setFocused(start);
		wantFocus.current = true;
	};

	const handleToggle = (e) => {
		const isOpen = e.newState === 'open';
		setOpen(isOpen);
		if (!isOpen) {
			onBlur?.({ type: 'blur', target: { name: name || id, id: baseId } });
		}
	};

	// ── keyboard: the WAI-ARIA date grid pattern ──
	const handleGridKeyDown = (e) => {
		const moves = {
			ArrowLeft: () => focused.subtract(1, 'day'),
			ArrowRight: () => focused.add(1, 'day'),
			ArrowUp: () => focused.subtract(1, 'week'),
			ArrowDown: () => focused.add(1, 'week'),
			Home: () => focused.subtract((focused.day() + 6) % 7, 'day'),
			End: () => focused.add(6 - ((focused.day() + 6) % 7), 'day'),
			PageUp: () => focused.subtract(1, e.shiftKey ? 'year' : 'month'),
			PageDown: () => focused.add(1, e.shiftKey ? 'year' : 'month'),
		};
		if (moves[e.key]) {
			e.preventDefault();
			focusDay(moves[e.key]());
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			choose(focused);
		}
	};

	const handleTriggerKeyDown = (e) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			popoverRef.current?.showPopover();
		}
	};

	// ── render ──
	const days = monthGrid(view);
	const weeks = Array.from({ length: 6 }, (_, w) =>
		days.slice(w * 7, w * 7 + 7)
	);
	// roving tabindex: the focused day if it's in view, else the 1st
	const tabbable = focused.isSame(view, 'month')
		? focused
		: view.startOf('month');

	const prevDisabled =
		minDay && view.subtract(1, 'month').endOf('month').isBefore(minDay, 'day');
	const nextDisabled =
		maxDay && view.add(1, 'month').startOf('month').isAfter(maxDay, 'day');
	const todayDisabled = isDisabled(today);

	return (
		<>
			<DateTrigger
				ref={triggerRef}
				type="button"
				id={baseId}
				popoverTarget={popoverId}
				disabled={disabled}
				onKeyDown={handleTriggerKeyDown}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls={popoverId}
				aria-required={required || undefined}
				style={{ anchorName: anchor }}
				$variant={variant}
				$isError={Boolean(isError)}
				$disabled={disabled}
				$open={open}
				{...fieldAria({ id: baseId, hint, isError, errormessage })}
			>
				{selected ? (
					<span>{selected.format('DD MMM YYYY')}</span>
				) : (
					<span className="sc_placeholder">{placeholder}</span>
				)}
				<span className="sc_adornment">
					<LuCalendar aria-hidden="true" />
				</span>
			</DateTrigger>

			{name && <input type="hidden" name={name} value={value ?? ''} />}

			<CalendarPopover
				ref={popoverRef}
				id={popoverId}
				popover="auto"
				role="dialog"
				aria-label="Choose a date"
				onBeforeToggle={handleBeforeToggle}
				onToggle={handleToggle}
				style={{ positionAnchor: anchor }}
			>
				<div className="sc_header">
					<button
						type="button"
						className="sc_nav"
						onClick={() => setView(view.subtract(1, 'month'))}
						disabled={prevDisabled}
						aria-label="Previous month"
					>
						<LuChevronLeft />
					</button>
					<span className="sc_month" aria-live="polite">
						{view.format('MMMM')}{' '}
						<span className="sc_year">{view.format('YYYY')}</span>
					</span>
					<button
						type="button"
						className="sc_nav"
						onClick={() => setView(view.add(1, 'month'))}
						disabled={nextDisabled}
						aria-label="Next month"
					>
						<LuChevronRight />
					</button>
				</div>

				<table role="grid" onKeyDown={handleGridKeyDown}>
					<thead>
						<tr>
							{WEEKDAYS.map((day) => (
								<th key={day} scope="col">
									{day}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{weeks.map((week) => (
							<tr key={week[0].format(FORMAT)}>
								{week.map((day) => {
									const isTabbable = day.isSame(tabbable, 'day');
									return (
										<td key={day.format(FORMAT)}>
											<button
												type="button"
												className="sc_day"
												ref={isTabbable ? focusRef : undefined}
												tabIndex={isTabbable ? 0 : -1}
												onClick={() => choose(day)}
												aria-label={day.format('dddd, D MMMM YYYY')}
												aria-pressed={
													selected ? day.isSame(selected, 'day') : false
												}
												aria-disabled={isDisabled(day) || undefined}
												data-outside={!day.isSame(view, 'month')}
												data-today={day.isSame(today, 'day')}
											>
												{day.date()}
											</button>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>

				<div className="sc_footer">
					<button
						type="button"
						className="sc_action"
						onClick={() => choose(today)}
						disabled={todayDisabled}
					>
						Today
					</button>
					<button
						type="button"
						className="sc_action"
						onClick={() => {
							emit('');
							popoverRef.current?.hidePopover();
							triggerRef.current?.focus();
						}}
						disabled={!selected}
					>
						Clear
					</button>
				</div>
			</CalendarPopover>
		</>
	);
}

DatePicker.propTypes = {
	baseId: PropTypes.string.isRequired,
	value: PropTypes.string,
	onChange: PropTypes.func,
	onBlur: PropTypes.func,
	name: PropTypes.string,
	id: PropTypes.string,
	min: PropTypes.string,
	max: PropTypes.string,
	placeholder: PropTypes.string,
	isError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	errormessage: PropTypes.node,
	hint: PropTypes.node,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	variant: PropTypes.oneOf(['filled', 'outline']),
};

export default DatePicker;
