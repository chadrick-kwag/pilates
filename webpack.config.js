const hwp = require('html-webpack-plugin')
const path = require('path')
const {DEV_GRAPHQL_PORT} = require('./config.js')

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: path.resolve(__dirname, 'src'),
                exclude: "/node_modules",
                use: "babel-loader"
            },
            {
                test: /\.css/,
                use: ["style-loader", "css-loader"]
            }, {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot)$/,
                use: 'file-loader?name=assets/[name].[hash].[ext]'
            }
        ]
    },
    plugins: [
        new hwp({
            template: "./src/template.html",
            favicon: "./src/assets/favicon.ico"
        })

    ],
    devServer: {
        open: "chrome",
        host: '0.0.0.0',
        port: 8899,
        compress: false,
        proxy: {
            '/graphql': `http://localhost:${DEV_GRAPHQL_PORT}`
        }
    }
}