import * as yup from 'yup';
import { THEME_SCHEMA } from './schema';

// Checks a theme against THEME_SCHEMA. Called from src/theme/index.js for
// every registered theme, in development only — throws on the first
// invalid theme with every problem listed.
//
// The schemas are built inside validateTheme (not at module load) so this
// file has no side effects and drops out of the production bundle.

const isEmpty = (value) => value == null || Object.keys(value).length === 0;

const isPlainObject = (value) =>
	value !== null && typeof value === 'object' && !Array.isArray(value);

// Step 1: a theme isn't empty, and every top-level entry is either a
// color string or a group of color strings — never nested deeper.
// Independent of which names exist.
const buildShapeSchema = () =>
	yup.lazy((theme) =>
		yup
			.object(
				Object.fromEntries(
					Object.entries(theme ?? {}).map(([key, value]) => [
						key,
						isPlainObject(value)
							? yup
									.object(
										Object.fromEntries(
											Object.keys(value).map((name) => [
												name,
												yup
													.string()
													.strict()
													.typeError(
														`${key}.${name} must be a color string — tokens can't be nested`
													),
											])
										)
									)
									.test(
										'not-empty',
										`${key} is empty`,
										(group) => !isEmpty(group)
									)
							: yup
									.string()
									.strict()
									.typeError(
										`${key} must be a color string or a group like { name: '#hex' }`
									),
					])
				)
			)
			.required('theme is missing')
			.test('not-empty', 'theme is empty', (value) => !isEmpty(value))
	);

// Step 2: exactly the names registered in THEME_SCHEMA, each in the right
// form — a group where the schema has an array, a single color otherwise.
const buildRegisteredSchema = () =>
	yup
		.object(
			Object.fromEntries(
				Object.entries(THEME_SCHEMA).map(([key, names]) => [
					key,
					Array.isArray(names)
						? yup
								.object(
									Object.fromEntries(
										names.map((name) => [
											name,
											yup
												.string()
												.strict()
												.required(`${key}.${name} is missing`),
										])
									)
								)
								.strict()
								.typeError(
									`${key} is a group in THEME_SCHEMA, not a single color`
								)
								.required(`${key} group is missing`)
								.noUnknown(
									true,
									({ unknown }) =>
										`${key} has token(s) not in THEME_SCHEMA: ${unknown}`
								)
						: yup
								.string()
								.strict()
								.typeError(
									`${key} is a single color in THEME_SCHEMA, not a group`
								)
								.required(`${key} is missing`),
				])
			)
		)
		.strict()
		.noUnknown(true, ({ unknown }) => `not in THEME_SCHEMA: ${unknown}`);

export const validateTheme = (name, tokens) => {
	try {
		// Shape first: a nesting error would only add noise to step 2.
		buildShapeSchema().validateSync(tokens, { abortEarly: false });
		buildRegisteredSchema().validateSync(tokens, { abortEarly: false });
	} catch (error) {
		const problems = error.errors?.map((message) => `  - ${message}`) ?? [];
		throw new Error(
			`[theme] "${name}" is invalid:\n${problems.join('\n') || error.message}`,
			{ cause: error }
		);
	}
};
