/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  env: {
    API_HOST: process.env.API_HOST || 'http://jam.local:1337',
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
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
