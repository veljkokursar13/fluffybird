module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
    ],
    plugins: [
        [
          'module-resolver',
          {
            root: ['.'],
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
            alias: {
              '@game.tsx': './app/game.tsx',
              '@': './',
              '@app': './app',
              '@src': './src',
              '@assets': './assets',
            },
          },
        ],
        'react-native-worklets/plugin', // Must be last for Reanimated v4+
      
    ],
  };
};
