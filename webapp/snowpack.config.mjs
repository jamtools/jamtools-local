/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  env: {
    API_HOST: process.env.API_HOST,
    LOCAL_MODE: process.env.LOCAL_MODE,
  },
  exclude: [
    'server/**',
    'webapp/_ignore/**',
    'webapp/_debug/**',
  ],
  workspaceRoot: '..',
  alias: {
    '@shared': '../shared',
  },
  mount: {
    /* ... */

  },
  plugins: [
    // ["tsconfig-paths-snowpack-plugin", {/* See Options */}],
    '@snowpack/plugin-sass',
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    polyfillNode: true,
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
