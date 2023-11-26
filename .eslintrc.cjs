module.exports = {
	extends: ["@antfu", "turbo", "plugin:svelte/recommended"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		// ...
		project: "tsconfig.base.json",
		extraFileExtensions: [".svelte"], // This is a required setting in `@typescript-eslint/parser` v4.24.0.
	},
	overrides: [
		{
			files: ["*.svelte"],
			parser: "svelte-eslint-parser",
			// Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
			parserOptions: {
				parser: "@typescript-eslint/parser",
			},
		},
		// ...
	],
	rules: {
		"turbo/no-undeclared-env-vars": "off",
		curly: "off",
		"n/prefer-global/process": ["error", "always"],
		"no-only-tests/no-only-tests": "off",
		"unused-imports/no-unused-vars": "off",
		"no-tabs": "off",
		"antfu/if-newline": "off",
		"unicorn/prefer-node-protocol": "off",
		"no-console": "off",
		"arrow-parens": "off",
		"operator-linebreak": "off",
		"quote-props": "off",
		"jsonc/indent": ["error", "tab"],
		"@stylistic/ts/brace-style": "off",
		"@stylistic/js/no-tabs": "off",
		"@stylistic/ts/indent": "off",
		"@stylistic/ts/member-delimiter-style": "off",
		"@stylistic/js/no-mixed-spaces-and-tabs": "off",
		"@stylistic/js/operator-linebreak": "off",
		"@typescript-eslint/brace-style": "off",
		"@typescript-eslint/semi": "off",
		"@typescript-eslint/quotes": "off",
		"@typescript-eslint/indent": "off",
		"@typescript-eslint/comma-dangle": "off",
		"@typescript-eslint/member-delimiter-style": "off",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				ignoreRestSiblings: true,
				caughtErrorsIgnorePattern: "^_",
			},
		],
	},
};
