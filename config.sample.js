// desktop config
const address = 'localhost'

const GRAPHQL_PORT_INTERNAL = 4000
const DEV_GRAPHQL_PORT = 4000

const MAIN_SERVE_PORT = 8080


const GRAPHQL_SUBPATH = '/graphql'

// detect node run mode
var env = process.env.NODE_ENV || 'production';



// used by apollo clients in react apps
let APOLLO_CLIENT_HTTP_TYPE
if(env === 'production'){
    APOLLO_CLIENT_HTTP_TYPE = 'https'
}
else{

    APOLLO_CLIENT_HTTP_TYPE = 'http'
}


const postgres_access_info = {
    user: 'dbuser',
    host: 'localhost',
    database: 'dbname',
    password: 'userpw',
    port: 5432,
}


const graphql_server_options = {
    host: '0.0.0.0',
    port: DEV_GRAPHQL_PORT
}

// used by deploy server
const ssl_key_path = 'path/to/key.pem'
const ssl_cert_path = 'path/to/cert.pem'

module.exports = {
    postgres_access_info, graphql_server_options, MAIN_SERVE_PORT,
    GRAPHQL_PORT_INTERNAL,
    address,
    GRAPHQL_SUBPATH,
    DEV_GRAPHQL_PORT,
    ssl_key_path,
    ssl_cert_path,
    APOLLO_CLIENT_HTTP_TYPE
}