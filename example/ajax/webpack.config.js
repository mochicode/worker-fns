let path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './index.js',
  devtool: 'inline-source-map',
  plugins: [new HtmlWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      }
    ]
  },
  resolve: {
    alias: {
      'worker-fns': path.resolve(__dirname, '../../lib/')
    }
  },
  devServer: {
    contentBase: './dist'
  }
}
