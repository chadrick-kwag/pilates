
const { ApolloServer, gql } = require('apollo-server');
const { graphql_server_options } = require('../config.js')
const { typeDefs, resolvers } = require('./merged_gql')
const { tokenCache } = require('./tokenCache')
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




const server = new ApolloServer({
    typeDefs, resolvers,
    context: ({ req }) => {
        const token = req.headers.authorization || '';

        console.log('received token: ')
        console.log(token)

        console.log(tokenCache)

        let account_id = tokenCache[token]
        console.log(account_id)
        if (account_id === undefined) {
            return { account_id: null }
        }
        else {
            return { account_id: account_id }
        }
    }
});


// The `listen` method launches a web server.
server.listen(graphql_server_options).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});