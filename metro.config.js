const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const ensureArray = (arr) => (Array.isArray(arr) ? arr : []);

const assetExts = new Set(ensureArray(config.resolver.assetExts));
const sourceExts = new Set(ensureArray(config.resolver.sourceExts));


['gguf', 'wasm'].forEach((ext) => sourceExts.delete(ext));
['gguf', 'wasm'].forEach((ext) => assetExts.add(ext));

config.resolver.assetExts = [...assetExts];
config.resolver.sourceExts = [...sourceExts];

config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return middleware(req, res, next);
  };
};

module.exports = withNativeWind(config, {
  input: './global.css',
});
