const address = 'localhost'
const GRAPHQL_PORT = 4000
const MAIN_SERVE_PORT = 8080

const gql_server_addr = `http://${address}:${GRAPHQL_PORT}`

const postgres_access_info = {
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'rootpw',
    port: 5432,
}


const graphql_server_options = {
    host: '0.0.0.0',
    port: GRAPHQL_PORT
}

module.exports = {
    gql_server_addr, postgres_access_info, graphql_server_options, MAIN_SERVE_PORT,
    GRAPHQL_PORT,
    address

}