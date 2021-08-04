const hwp = require('html-webpack-plugin')
const path = require('path')
const { GRAPHQL_PORT_INTERNAL } = require('./config.js')
const TerserPlugin = require("terser-webpack-plugin");

let config = {
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
        host: 'localhost',
        port: 8899,
        compress: false,
        proxy: {
            '/graphql': `http://localhost:${GRAPHQL_PORT_INTERNAL}`
        }
    }
}



module.exports = (env, argv)=>{

    if(argv.mode === 'production'){
        config.optimization = {
            minimize: true,
            minimizer: [new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            })]
        }
    }

    console.log(config)

    return config
}