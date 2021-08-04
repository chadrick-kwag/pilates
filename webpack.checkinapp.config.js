const hwp = require('html-webpack-plugin')
const path = require('path')
const { GRAPHQL_PORT_INTERNAL } = require('./config.js')
const TerserPlugin = require("terser-webpack-plugin");


module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        return {
            entry: './checkin_app_src/app.js',
            output: {
                path: path.resolve(__dirname, 'checkin_app_dist'),
                filename: 'bundle.js'
            },
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        include: path.resolve(__dirname, 'checkin_app_src'),
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
                    template: "./checkin_app_src/template.html"
                    
                })

            ],
            devServer: {
                open: "chrome",
                host: 'localhost',
                port: 9001,
                compress: false,
                proxy: {
                    '/graphql': `http://localhost:${GRAPHQL_PORT_INTERNAL}`
                }
            }
        }
    }
    else {
        return {
            entry: './checkin_app_src/app.js',
            output: {
                path: path.resolve(__dirname, 'checkin_app_dist'),
                filename: 'bundle.js'
            },
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        include: path.resolve(__dirname, 'checkin_app_src'),
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
                    template: "./checkin_app_src/template.html",
                    publicPath: "/checkin"
                })

            ],
            optimization: {
                minimize: true,
                minimizer: [new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true
                        }
                    }
                })]
            },
            devServer: {
                open: "chrome",
                host: 'localhost',
                port: 9001,
                compress: false,
                proxy: {
                    '/graphql': `http://localhost:${GRAPHQL_PORT_INTERNAL}`
                }
            }
        }
    }
}