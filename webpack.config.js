const hwp = require('html-webpack-plugin')
const path = require('path')

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module:{
        rules:[
            {
                test: /\.jsx?$/,
                include: path.resolve(__dirname, 'src'),
                exclude : "/node_modules",
                loader: "babel-loader"
            },
            {
                test: /\.css/,
                loader: ["style-loader", "css-loader"]
            }
        ]
    },
    plugins: [
        new hwp({
            template: "./src/template.html"
        })
    ],
    devServer:{
        open: "chrome"
    }
}