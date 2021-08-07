const { postgres_access_info, graphql_server_options } = require('../config.js')
const { Pool, Client } = require('pg')

const pool = new Pool({
    ...postgres_access_info,
    max: 20
})

const pgclient = new Client(postgres_access_info)


module.exports = {
    pgclient,
    pool
}