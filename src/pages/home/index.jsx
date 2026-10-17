import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { THEMES, themeVars } from '../../theme';
import { setTheme } from '../../store/slice/app-theme';
import { Swatch, AccentButton } from './elements/index.style';

// Placeholder until §A.1 Home is designed — a live preview of every token
// in the active theme, so color changes can be checked by eye.
// Uses both styling paths on purpose (Tailwind + styled-components).
function Home() {
	const dispatch = useDispatch();
	const { theme } = useSelector((state) => state.themes);
	const { tokens } = THEMES[theme];

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-10">
			<header className="mb-8 flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-(--pg-text-primary)">
						PolyGrid
					</h1>
					<p className="text-(--pg-text-secondary)">
						Theme token preview — setup check
					</p>
				</div>
				<div className="flex gap-2">
					{Object.entries(THEMES).map(([name, { label }]) => (
						<AccentButton
							key={name}
							$active={name === theme}
							onClick={() => dispatch(setTheme(name))}
						>
							{label}
						</AccentButton>
					))}
				</div>
			</header>

			{Object.entries(tokens).map(([group, values]) => (
				<section key={group} className="mb-8">
					<h2 className="mb-3 text-sm font-semibold tracking-wide text-(--pg-text-secondary) uppercase">
						{group}
					</h2>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{/* a single color shows as one swatch named after itself */}
						{(typeof values === 'string'
							? [[group, values, themeVars[group]]]
							: Object.entries(values).map(([name, value]) => [
									name,
									value,
									themeVars[group][name],
								])
						).map(([name, value, cssVar]) => (
							<Swatch key={name}>
								<div className="swatch-chip" style={{ background: cssVar }} />
								<span className="swatch-name">{name}</span>
								<span className="swatch-value">{value}</span>
							</Swatch>
						))}
					</div>
				</section>
			))}
		</main>
	);
}

export default Home;
