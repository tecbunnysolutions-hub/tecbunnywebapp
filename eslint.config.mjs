import boundaries from "eslint-plugin-boundaries";
import importX from "eslint-plugin-import-x";

export const rootConfig = [
  {
    plugins: {
      boundaries,
      "import-x": importX,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "apps/*" },
        { type: "ui", pattern: "packages/ui" },
        { type: "infra", pattern: "packages/infra" },
        { type: "package", pattern: "packages/*" }
      ],
    },
    rules: {
      "import-x/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: ["**/*.test.ts", "**/*.test.tsx", "eslint.config.mjs", "next.config.mjs", "next.config.ts"],
          optionalDependencies: false,
          peerDependencies: true,
        }
      ],
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: "app",
              disallow: ["app"],
              message: "Apps cannot import from other apps. Use a shared package instead."
            },
            {
              from: "ui",
              disallow: ["infra"],
              message: "UI package cannot import from the infra package."
            }
          ]
        }
      ]
    }
  }
];

export default rootConfig;
