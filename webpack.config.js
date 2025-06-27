const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add support for CSS modules and PostCSS
  config.module.rules.push({
    test: /\.css$/,
    use: [
      'style-loader',
      'css-loader',
      'postcss-loader'
    ]
  });
  
  return config;
};
