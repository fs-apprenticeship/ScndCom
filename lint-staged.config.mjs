/**
 * @type {import('lint-staged').Configuration}
 */
const config = {
  // Excludes core files handled below to prevent race conditions, but format everything else
  "**/!(package-lock|*.js|*.jsx|*.mjs|*.ts|*.tsx|*.css|*.prisma)": [
    "prettier --ignore-unknown --write",
  ],

  // Domain specific formatting and linting
  "**/*.prisma": ["prisma format", "prisma validate", "prisma-lint"],
  "**/*.{css,module.css}": ["stylelint --fix", "prettier --write"],

  // Atomic pipeline for core code
  "**/*.{js,jsx,md,mjs,ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write",
    () => "npm run check-types",
  ],
};

export default config;
