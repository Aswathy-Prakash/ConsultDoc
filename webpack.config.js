const webpack = require('webpack');
const stream = require('stream-browserify');

module.exports = {
  // ...
  resolve: {
    fallback: {
      stream: stream,
      crypto: require.resolve('crypto-browserify')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  node: {
    crypto: true,
    stream: true,
  }
};
