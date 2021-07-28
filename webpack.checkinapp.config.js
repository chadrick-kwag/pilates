const hwp = require('html-webpack-plugin')
const path = require('path')
const {GRAPHQL_PORT_INTERNAL} = require('./config.js')

module.exports = {
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
            publicPath: (()=>{
                
                console.log(process.env.NODE_ENV)

                if(process.env.NODE_ENV==='WEBPACK_DEV_SERVER'){
                    return '/'
                }
                else{
                    return "/checkin"
                }
            })()
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