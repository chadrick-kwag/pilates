const gql_server_addr = "http://mysite:4000/"

const postgres_access_info = {
    user: 'someuser',
    host: 'localhost',
    database: 'somedb',
    password: 'somepw',
    port: 5432,
}


const graphql_server_options = {
    host: '0.0.0.0',
    port: 4000
}

module.exports = {
    gql_server_addr, postgres_access_info, graphql_server_options
}