module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
    ],
    plugins: [
        require.resolve('expo-router/babel'),
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
            },
          },
        ],
        'react-native-reanimated/plugin',
      
    ],
  };
};
