require('dotenv').config();

const webpack = require('webpack');

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer';
      config.plugins.push(
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify('cesium'),
        }),
      );
    }

    return config;
  },
};
