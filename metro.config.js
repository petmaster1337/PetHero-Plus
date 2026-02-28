const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 👇 Add custom watch folders
config.watchFolders = [
  path.resolve(__dirname, './app'),
  path.resolve(__dirname, './assets'),
  path.resolve(__dirname, './components'),
  path.resolve(__dirname, './constants'),
  path.resolve(__dirname, './hooks'),
  path.resolve(__dirname, './providers'),
  path.resolve(__dirname, './services'),
];

config.resolver.alias = {
  '@': path.resolve(__dirname, '..')
};

// Optional: add custom extensions if needed
config.resolver.sourceExts.push('cjs'); // or 'mjs', etc.

// Optional: enable symlink support (for pnpm or linked packages)
config.resolver.resolveRequest = null;

module.exports = config;
