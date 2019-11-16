var path = require("path");

var distribution = {
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