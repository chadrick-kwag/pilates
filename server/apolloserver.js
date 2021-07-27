const { ApolloServer, gql } = require('apollo-server');
const { typeDefs, resolvers } = require('./merged_gql')
const { get_account_id_for_token } = require('./tokenCache')

const server = new ApolloServer({
    typeDefs, resolvers,
    context: ({ req }) => {
        const token = req.headers.authorization || '';

        let account_id = get_account_id_for_token(token)
        
        return {
            account_id
        }
    }
});


module.exports = server