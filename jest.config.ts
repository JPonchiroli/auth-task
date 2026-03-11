import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
 //Descomente na Etapa 10 do GUIA_EVOLUTIVO.md para exigir cobertura mínima
 coverageThreshold: {
   global: {
     statements: 85,
     branches: 80,
     functions: 85,
     lines: 85,
   },
 },
};

export default createJestConfig(config);
