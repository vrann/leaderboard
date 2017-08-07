var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpackConfig = {
    entry: './src/app.js',
    output: {
      filename: 'js/output.[hash].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      loaders: [
            {test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
            {test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })},
            {test: /\.less$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader!less-loader' })}
        ]
    },
    resolve: {
      alias: {
        elasticsearch$: 'elasticsearch-browser/elasticsearch.angular'
      }
    },
    plugins: [
      new ExtractTextPlugin('css/styles.css'),
      new CopyWebpackPlugin([
          //{ from: 'node_modules/bootstrap/dist/css', to: 'css/'},
          //{ from: 'css', to: 'css/'},
          { from: 'fonts', to: 'fonts/'},
          { from: 'img', to: 'img/'}
      ]),
      new HtmlWebpackPlugin(
        {template: 'index.ejs'}
      ),
      new HtmlWebpackIncludeAssetsPlugin({
          assets: [
            //'css/bootstrap.min.css', 
            'css/styles.css'
            // 'css/jquery.switchButton.css',
            // 'css/app.css',
            // 'fonts/style.css',            
            // 'css/configure-toolbox.css'
          ],
          append: false
      })
  ]};
module.exports = webpackConfig;