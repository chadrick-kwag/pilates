
const { ApolloServer, gql } = require('apollo-server');
// const { ApolloServer, gql } = require('apollo-server-express');

const moment = require('moment-timezone');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');

const lesson_typedefs = require('./typedefs/lesson_typedefs')
const client_typedefs = require('./typedefs/client_typedefs')
const subscription_typedefs = require('./typedefs/subscription_typedefs')
const instructor_typedefs = require('./typedefs/instructor_typedefs')
const common_typedefs = require('./typedefs/common_typedefs')
const apprentice_course_typedefs = require('./typedefs/apprentince_course_typedefs')
const apprentice_instructor_typedefs = require('./typedefs/apprentice_instructor_typedefs')

const { graphql_server_options, DEV_GRAPHQL_PORT } = require('../config.js')

const lesson_resolver = require('./resolvers/lesson_resolvers')
const client_resolver = require('./resolvers/client_resolvers')
const subscription_resolver = require('./resolvers/subscription_resolvers')
const instructor_resolver = require('./resolvers/instructor_resolvers')
const apprentice_course_resolver = require('./resolvers/apprentice_course_resolvers')
const apprentice_instructor_resolver = require('./resolvers/apprentice_instructor_resolvers')


const pgclient  = require('./pgclient')

const typeDefs = mergeTypeDefs([ lesson_typedefs, client_typedefs, subscription_typedefs, instructor_typedefs, common_typedefs, apprentice_course_typedefs, apprentice_instructor_typedefs])



pgclient.connect(err => {
    if (err) {
        console.log(err)
        console.log("pgclient connect err")
    }

    else {
        console.log("pgclient connect success")
    }
})




let resolvers = mergeResolvers([lesson_resolver, client_resolver, subscription_resolver, instructor_resolver, apprentice_course_resolver, apprentice_instructor_resolver])

const server = new ApolloServer({ typeDefs, resolvers });


// The `listen` method launches a web server.
server.listen(graphql_server_options).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});