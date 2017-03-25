var webpack = require('webpack');
var path = require('path');
var config = {
    entry: './main.js',
    output: {
       path: path.join(__dirname, '/dist'),
       publicPath: '/',
       filename: 'bundle.js'
    },
    devServer: {
        inline: true,
        port: 8080
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react']
            }
        },
       {
       test: /\.css$/,
       loader: "style-loader!css-loader"
       },
       {
         test: /\.png$/,
         loader: "url-loader?limit=100000"
       },
       {
         test: /\.PNG$/,
         loader: "url-loader?limit=100000"
       },
       {
         test: /\.jpg$/,
         loader: "file-loader"
       },
       {
         test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
         loader: 'url-loader?limit=10000&mimetype=application/font-woff'
       },
       {
         test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
         loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
       },
       {
         test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
         loader: 'file-loader'
       },
       {
         test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
         loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
       }
      ]
    },
    plugins:[
      new webpack.ProvidePlugin({
          jQuery: 'jquery',
          $: 'jquery',
          jquery: 'jquery'
      })
    ]
}

module.exports = config;
