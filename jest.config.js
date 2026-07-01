/** @type {import('ts-jest').JestConfigWithTsJest} */
const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
};

module.exports = {
  projects: [
    {
      // Integração (rotas/API) + unit — ambiente node, MongoDB em memória.
      // `*.test.ts` (não `.tsx`) mantém todas as suites node; componentes usam `.tsx`.
      displayName: 'node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      moduleNameMapper,
    },
    {
      displayName: 'components',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/components/**/*.test.tsx'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.components.ts'],
      moduleNameMapper,
    },
  ],
};
