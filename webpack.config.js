var path = require("path");

var path = require('path');

module.exports = {
    entry: [
        "./src/index.js"
    ],
    output: {
        filename: 'main.js',
        library: "clarityPatternParser",
        libraryTarget: "umd",
        path: path.resolve(__dirname, 'dist')
    }
};