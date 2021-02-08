const express = require('express');
const path = require('path');
const {MAIN_SERVE_PORT}= require('../config')
const app = express();



const { ApolloServer, gql } = require('apollo-server');


const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');

const lesson_typedefs = require('./typedefs/lesson_typedefs')
const client_typedefs = require('./typedefs/client_typedefs')
const subscription_typedefs = require('./typedefs/subscription_typedefs')
const instructor_typedefs = require('./typedefs/instructor_typedefs')
const common_typedefs = require('./typedefs/common_typedefs')

const { graphql_server_options } = require('../config.js')

const lesson_resolver = require('./resolvers/lesson_resolvers')
const client_resolver = require('./resolvers/client_resolvers')
const subscription_resolver = require('./resolvers/subscription_resolvers')
const instructor_resolver = require('./resolvers/instructor_resolvers')


const pgclient  = require('./pgclient')

const typeDefs = mergeTypeDefs([ lesson_typedefs, client_typedefs, subscription_typedefs, instructor_typedefs, common_typedefs])






const DIST_DIR = path.join(__dirname, '../dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');




app.use(express.static(DIST_DIR)); 


app.get('/', (req, res) => {
    res.sendFile(HTML_FILE);
});
app.listen(MAIN_SERVE_PORT, function () {
    console.log('App listening on port: ' + MAIN_SERVE_PORT);
});



pgclient.connect(err => {
    if (err) {
        console.log("pgclient connect err")
        process.exit()
    }

    else {
        console.log("pgclient connect success")
        
    }
})




let resolvers = mergeResolvers([lesson_resolver, client_resolver, subscription_resolver, instructor_resolver])

const server = new ApolloServer({ typeDefs, resolvers });
console.log(graphql_server_options)
// The `listen` method launches a web server.
server.listen(graphql_server_options).then(({ url }) => {
    console.log(`Server ready at ${url}`);
}).catch(e=>{
    console.log(e)
    process.exit()
});