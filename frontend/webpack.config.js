var path = require('path');
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


var webpackConfig = {
    entry: './src/app.js',
    output: {
      filename: 'js/output.bundle.js',
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
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      }),
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

    //"angular-chart.js": "^1.1.1",
    //"angular-ui-bootstrap": "^2.5.0",
    //"angular-ui-router": "^0.4.2",
    //"bootstrap": "3.3.7",
    //"chart.js": "^2.5.0",
    //"elasticsearch": "^13.0.0",
    //"elasticsearch-browser": "^12.1.3",
    //"ui-bootstrap": "^0.1.10",
    //"ui-router-extras": "^0.1.3"