/** @type {import('stylelint').Config} */
const config = {
  extends: ["stylelint-config-standard"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "custom-variant",
          "utility",
          "apply",
          "source",
          "tailwind",
          "plugin",
        ],
      },
    ],
    "color-function-notation": "modern",
    "import-notation": "string", // Tailwind v4 uses @import "tailwindcss";
  },
};

export default config;
