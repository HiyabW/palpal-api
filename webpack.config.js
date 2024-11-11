const path = require('path');

module.exports = {
  entry: './app.js', // Entry point for your front-end code
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory for bundled files
    filename: 'bundle.js' 
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply to JavaScript files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader', // Use Babel to transpile JavaScript
          options: {
            presets: ['@babel/preset-env'] // Use the latest JavaScript features
          }
        }
      }
    ]
  }
};