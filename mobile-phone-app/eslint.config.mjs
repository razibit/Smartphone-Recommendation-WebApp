import nextConfig from 'eslint-config-next/core-web-vitals';

const projectConfig = [
  ...nextConfig,
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'output/**',
      'next-env.d.ts',
    ],
    rules: {
      // These effects subscribe to browser/API state and intentionally update
      // their local view when the external source changes.
      'react-hooks/set-state-in-effect': 'off',
      // The image component intentionally uses a controlled native image
      // element for arbitrary catalogue URLs and its own lazy-loading fallback.
      '@next/next/no-img-element': 'off',
    },
  },
];

export default projectConfig;
