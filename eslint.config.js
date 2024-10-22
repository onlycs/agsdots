// ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import globals from 'globals';

const tslintconfig = [
	eslint.configs.recommended,
	stylistic.configs.customize({
		indent: 'tab',
		quotes: 'single',
		semi: true,
		jsx: true,
	}),
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
];

// some of these should still be errors, but most should be warnings- we'll fix the others later
const warnings = tslintconfig.map((config) => {
	const warned = Object.entries({ ...config.rules }).map(([rule, value]) => {
		if (value instanceof Array) value = ["warn", ...value.slice(1)];
		else value = "warn";

		return [rule, value];
	});

	return {
		ignores: ['types/*', 'node_modules/*', '**/*.js'],
		...config,
		rules: {
			...Object.fromEntries(warned),
		},
	};
});

export default [
	...warnings,
	{
		ignores: ['types/*', 'node_modules/*', '**/*.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				Widget: 'readonly',
				Bun: 'readonly',
				Service: 'readonly',
				App: 'readonly',
				Utils: 'readonly',
				Variable: 'readonly',
				...globals.node,
			}
		},
		rules: {
			// disable eslint rules that are already covered by tseslint
			"no-unused-vars": "off",
			"no-unused-expressions": "off",
			"no-useless-constructor": "off",
			"no-empty-function": "off",

			"@typescript-eslint/array-type": ["warn", { default: 'array-simple' }],
			"@typescript-eslint/await-thenable": "error",
			"@typescript-eslint/class-methods-use-this": "warn",
			"@typescript-eslint/consistent-type-exports": "warn",
			"@typescript-eslint/consistent-type-imports": "warn",
			"@typescript-eslint/default-param-last": "error",
			"@typescript-eslint/explicit-member-accessibility": ["warn", { accessibility: 'no-public' }],
			"@typescript-eslint/init-declarations": "error",
			"@typescript-eslint/naming-convention": ["warn", {
				selector: 'variableLike',
				format: ['snake_case'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'forbid',
			}, {
				selector: 'typeLike',
				format: ['PascalCase'],
				leadingUnderscore: 'forbid',
				trailingUnderscore: 'forbid',
			}, {
				selector: 'import',
				format: ['PascalCase', 'UPPER_CASE', 'snake_case'],
				leadingUnderscore: 'forbid',
				trailingUnderscore: 'forbid',
			}, {
				selector: 'function',
				format: ['snake_case', 'PascalCase'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'forbid',
			}, {
				selector: 'variable',
				format: ['PascalCase', 'snake_case'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'forbid',
				types: ['function']
			},{
				selector: 'variable',
				format: ['UPPER_CASE', 'snake_case', 'PascalCase'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'forbid',
				modifiers: ['const']
			}],
			"@typescript-eslint/no-duplicate-enum-values": "error",
			"@typescript-eslint/no-duplicate-type-constituents": "error",
			"@typescript-eslint/no-explicit-any": "off", // why are ts ppl so afraid of any?
			"@typescript-eslint/no-implied-eval": "error",
			"@typescript-eslint/no-import-type-side-effects": "error",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-redundant-type-constituents": "error",
			"@typescript-eslint/no-require-imports": "error",
			"@typescript-eslint/no-unnecessary-parameter-property-assignment": "error",
			"@typescript-eslint/no-unnecessary-qualifier": "warn",
			"@typescript-eslint/no-unnecessary-type-arguments": "error",
			"@typescript-eslint/no-unnecessary-type-constraint": "error",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-declaration-merging": "error",
			"@typescript-eslint/no-unsafe-enum-comparison": "off",
			"@typescript-eslint/no-unsafe-function-type": "error",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/no-unsafe-unary-minus": "error",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-unused-vars": ["warn", {
				args: 'all',
				argsIgnorePattern: '^_',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_',
				vars: 'all',
				varsIgnorePattern: '^_',
			}],
			"@typescript-eslint/no-use-before-define": "error",
			"@typescript-eslint/no-useless-empty-export": "error",
			"@typescript-eslint/prefer-destructuring": ["warn", {
				VariableDeclarator: {
					array: true,
					object: true,
				},
				AssignmentExpression: {
					array: false,
					object: false,
				},
			}],
			"@typescript-eslint/promise-function-async": "error",
			"@typescript-eslint/require-array-sort-compare": ["error", { ignoreStringArrays: true }],
			"@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true, allowBoolean: true }],
			"@typescript-eslint/return-await": ["error", 'in-try-catch'],
			"@typescript-eslint/switch-exhaustiveness-check": "error",
			"@typescript-eslint/use-unknown-in-catch-callback-variable": "off",

			"@stylistic/brace-style": ["warn", '1tbs', { allowSingleLine: true }],
			"@stylistic/no-tabs": "off",
		}
	}
];