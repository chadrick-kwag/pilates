const hwp = require('html-webpack-plugin')
const path = require('path')
const { GRAPHQL_PORT_INTERNAL } = require('./config.js')

module.exports = {
    entry: './scheduleview_src/App.js',
    output: {
        path: path.resolve(__dirname, 'scheduleview_dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: path.resolve(__dirname, 'scheduleview_src'),
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
            template: "./scheduleview_src/template.html",
            favicon: "./src/assets/favicon.ico"
        })

    ],
    devServer: {
        open: "chrome",
        host: 'localhost',
        port: 9004,
        compress: false,
        proxy: {
            '/graphql': `http://localhost:${GRAPHQL_PORT_INTERNAL}`
        }

    }
}