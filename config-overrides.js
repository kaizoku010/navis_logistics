module.exports = function override(config, env) {
  config.resolve.fallback = {
    "assert": require.resolve("assert/"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "timers": require.resolve("timers-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "zlib": require.resolve("browserify-zlib"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("stream-http"),
    "fs": false,
    "dns": false,
    "net": false,
    "tls": false,
    "child_process": false,
    "timers/promises": false,
    // Add MongoDB related modules that don't work in browser
    "mongodb": false,
    "bson": false,
    "util": false
  };

  return config;
};