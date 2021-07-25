
const { ApolloServer, gql } = require('apollo-server');
const { graphql_server_options } = require('../config.js')

const {typeDefs, resolvers} = require('./merged_gql')

const pgclient = require('./pgclient')


pgclient.connect(err => {
    if (err) {
        console.log(err)
        console.log("pgclient connect err")
    }

    else {
        console.log("pgclient connect success")
    }
})




const server = new ApolloServer({ typeDefs, resolvers });


// The `listen` method launches a web server.
server.listen(graphql_server_options).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});