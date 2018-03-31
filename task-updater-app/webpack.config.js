module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        use: {
          loader: 'file?name=fonts/[name].[ext]'
        }
      },
      { test: /\.css$/, use: { loader: 'css-loader/locals'}},
    ]
  }
};
