const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so edits to the library hot-reload.
config.watchFolders = [workspaceRoot];

// Metro should look for modules in this project's node_modules AND the root's.
// With node-linker=hoisted (see examples/native/.npmrc) the package should appear
// as a symlink at examples/native/node_modules/llm-markdown, and Metro will
// follow it via the `exports` field below.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Required for pnpm monorepos so Metro doesn't walk up the tree looking for
// duplicate copies of hoisted packages.
config.resolver.disableHierarchicalLookup = true;

// Honor the `exports` field in package.json — needed for `llm-markdown/native`
// to resolve to `dist/native.js`. Metro >= 0.80.
config.resolver.unstable_enablePackageExports = true;

// Let Metro follow the symlink that pnpm creates at
// examples/native/node_modules/llm-markdown -> workspace root.
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
