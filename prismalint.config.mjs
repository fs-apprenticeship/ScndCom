/** @type {import("prisma-lint").PrismaLintConfig} */

const config = {
  rules: {
    // Ensure enum names use PascalCase (e.g., UserRole)
    "enum-name-pascal-case": ["error"],

    // Enforce a consistent case style for enum values (e.g., UPPER_CASE)
    "enum-value-case": ["error", { case: "upper", style: "snake" }],

    // Require field names to use camelCase
    "field-name-camel-case": ["error"],

    // Enforce a specific prefix for model names
    // "model-name-prefix": ["error"],

    // Field names should be singular or plural according to their meaning
    "field-name-grammatical-number": ["error", { ifList: "plural" }],

    // Automatically map camelCase fields to snake_case in the database
    "field-name-mapping-snake-case": ["error"],

    // Enforce a consistent order of fields in models (e.g., id first, timestamps last)
    "field-order": [
      "error",
      { order: ["id", "...", "createdAt", "updatedAt"] },
    ],

    // Disallow required fields that are ignored in the database
    "forbid-required-ignored-field": ["error"],

    // Ensure model names are singular or plural according to their meaning
    "model-name-grammatical-number": ["error", { style: "singular" }],

    // Disallow fields of type String without a length constraint
    // "ban-unbounded-string-type": ["warn"],

    // Automatically map PascalCase model names to snake_case in the database
    "model-name-mapping-snake-case": ["error", { pluralize: true }],

    // Require model names to use PascalCase
    "model-name-pascal-case": ["error"],

    // Ensure array fields have a default empty array if not required
    "require-default-empty-arrays": ["error"],

    // Prevent usage of certain fields entirely
    // "forbid-field": ["error"],

    // All models must have the listed fields
    "require-field": ["error", { require: ["id", "createdAt", "updatedAt"] }],

    // Require explicit @id or @unique annotations on fields as appropriate
    "require-field-index": ["error", { forAllRelations: true }],

    // All fields must have an explicit type declared
    "require-field-type": [
      "error",
      {
        require: [
          { ifName: "/At$/", type: "DateTime" },
          { ifName: "id", nativeType: "Uuid", type: "String" },
        ],
      },
    ],
  },
};

export default config;
