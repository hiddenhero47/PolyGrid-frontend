// Shared, non-component helpers for the form kit.

// ids for the hint/error text, so a control can point aria-describedby at
// whichever is showing.
export const fieldMessageIds = (id) => ({
	hintId: `${id}-hint`,
	errorId: `${id}-error`,
});

// What a control puts on its native element for screen readers.
export const fieldAria = ({ id, hint, isError, errormessage }) => {
	const { hintId, errorId } = fieldMessageIds(id);
	// The error replaces the hint on screen, so point at whichever is shown.
	const showError = Boolean(isError && errormessage);
	const describedBy = showError ? errorId : hint ? hintId : undefined;
	return {
		'aria-invalid': isError ? true : undefined,
		'aria-describedby': describedBy,
	};
};

// ISO strings from the backend ('2026-03-01T00:00:00.000Z') → 'YYYY-MM-DD'
export const toDateValue = (value) => (value ? String(value).slice(0, 10) : '');

// ── Popovers (select menu, date calendar) ──

// CSS anchor positioning: Chrome 125+, Safari 26+. Elsewhere a popover is
// placed by placePopover() from its `beforetoggle` event.
export const SUPPORTS_ANCHOR =
	typeof CSS !== 'undefined' && CSS.supports?.('anchor-name: --a');

// anchor-name must be a CSS dashed-ident — strip useId's punctuation.
export const anchorName = (prefix, id) =>
	`--${prefix}-${String(id).replace(/[^a-zA-Z0-9_-]/g, '')}`;

// Fallback placement (same rules as the CSS): below the trigger unless
// there's more room above, capped to that room so it scrolls inside
// instead of running off screen. `matchWidth` = as wide as the trigger
// (select menus); `needs` = the height it would like (calendar ~400px).
const GAP = 6;
const EDGE = 8;

export const placePopover = (
	trigger,
	popover,
	{ matchWidth = true, needs = 320 } = {}
) => {
	if (SUPPORTS_ANCHOR || !trigger || !popover) return;
	const rect = trigger.getBoundingClientRect();
	const below = window.innerHeight - rect.bottom - GAP - EDGE;
	const above = rect.top - GAP - EDGE;
	const openAbove = below < needs && above > below;

	const width = matchWidth ? rect.width : popover.offsetWidth || 312;
	const left = Math.min(rect.left, window.innerWidth - width - EDGE);
	popover.style.left = `${Math.max(EDGE, left)}px`;
	if (matchWidth) popover.style.width = `${rect.width}px`;
	popover.style.maxHeight = `${Math.max(openAbove ? above : below, 160)}px`;

	if (openAbove) {
		popover.style.top = 'auto';
		popover.style.bottom = `${window.innerHeight - rect.top + GAP}px`;
	} else {
		popover.style.bottom = 'auto';
		popover.style.top = `${rect.bottom + GAP}px`;
	}
};
