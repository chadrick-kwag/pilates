const address = 'localhost'
const GRAPHQL_PORT_EXTERNAL = 4000
const GRAPHQL_PORT_INTERNAL = 4000

const MAIN_SERVE_PORT = 8080

const GRAPHQL_SUBPATH = '/graphql'

// const gql_server_addr = `http://${address}:${GRAPHQL_PORT_EXTERNAL}`
const gql_server_addr = `http://${address}:${MAIN_SERVE_PORT}${GRAPHQL_SUBPATH}`



const postgres_access_info = {
    user: 'postgres',
    host: 'localhost',
    database: 'test4',
    password: 'rootpw',
    port: 5432,
}


const graphql_server_options = {
    host: '0.0.0.0',
    port: GRAPHQL_PORT_INTERNAL
}

module.exports = {
    gql_server_addr, postgres_access_info, graphql_server_options, MAIN_SERVE_PORT,
    GRAPHQL_PORT_INTERNAL, GRAPHQL_PORT_EXTERNAL,
    address,
    GRAPHQL_SUBPATH

}