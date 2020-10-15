
const { ApolloServer, gql } = require('apollo-server');

const moment = require('moment-timezone');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');

const lesson_typedefs = require('./lesson_typedefs')
const client_typedefs = require('./client_typedefs')
const subscription_typedefs = require('./subscription_typedefs')
const instructor_typedefs = require('./instructor_typedefs')
const common_typedefs = require('./common_typedefs')

const { graphql_server_options } = require('../config.js')

const lesson_resolver = require('./resolvers/lesson_resolvers')
const client_resolver = require('./resolvers/client_resolvers')
const subscription_resolver = require('./resolvers/subscription_resolvers')
const instructor_resolver = require('./resolvers/instructor_resolvers')


const pgclient  = require('./pgclient')


function incoming_time_string_to_postgres_epoch_time(time_str) {
    let a = new Date(time_str)
    return a.getTime() / 1000
}


function parse_incoming_gender_str(gender_str) {
    if (gender_str == null) {
        return null
    }

    let gender = null
    if (gender_str.toLowerCase() == 'male') {
        gender = 'MALE'
    }
    else if (gender_str.toLowerCase() == 'female') {
        gender = 'FEMALE'
    }

    return gender

}

function parse_incoming_date_utc_string(date_utc_str) {
    // return epoch seconds
    if (date_utc_str == null) {
        return null
    }

    return new Date(date_utc_str).getTime() / 1000


}


const typeDefs = mergeTypeDefs([ lesson_typedefs, client_typedefs, subscription_typedefs, instructor_typedefs, common_typedefs])



pgclient.connect(err => {
    if (err) {
        console.log("pgclient connect err")
    }

    else {
        console.log("pgclient connect success")
    }
})




let resolvers = mergeResolvers([lesson_resolver, client_resolver, subscription_resolver, instructor_resolver])

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(graphql_server_options).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});