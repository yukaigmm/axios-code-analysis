const path = require("path");

const config = {
    entry: "./axios.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "axios.js"
    },
    mode: "development",
}

module.exports = config;

