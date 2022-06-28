const path = require('path')
const NodemonPlugin = require('nodemon-webpack-plugin')

module.exports = {
    entry: './server.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    target: 'node',
    plugins: [
        new NodemonPlugin()
    ]
}