import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Enforce snake_case for database-related properties
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "property",
          "format": ["snake_case"],
          "filter": {
            "regex": "^(source_url|created_at|processed_at|.*_at|.*_by|.*_id)$",
            "match": true
          }
        },
        {
          "selector": "property",
          "format": ["camelCase"],
          "filter": {
            "regex": "^(source_url|created_at|processed_at|.*_at|.*_by|.*_id)$",
            "match": false
          }
        }
      ],
      // Enforce PascalCase for React components
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "typeLike",
          "format": ["PascalCase"]
        }
      ]
    }
  }
];

export default eslintConfig;
