const express = require('express');
const path = require('path');
const {MAIN_SERVE_PORT, GRAPHQL_SUBPATH}= require('../config')
const app = express();

const { ApolloServer, gql } = require('apollo-server-express');


const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const { graphql_server_options } = require('../config.js')

const lesson_typedefs = require('./typedefs/lesson_typedefs')
const client_typedefs = require('./typedefs/client_typedefs')
const subscription_typedefs = require('./typedefs/subscription_typedefs')
const instructor_typedefs = require('./typedefs/instructor_typedefs')
const common_typedefs = require('./typedefs/common_typedefs')
const apprentice_course_typedefs = require('./typedefs/apprentince_course_typedefs')
const apprentice_instructor_typedefs = require('./typedefs/apprentice_instructor_typedefs')
const apprentice_plan_typedefs = require('./typedefs/apprentice_plan_typedefs')
const apprentice_lesson_typedefs = require('./typedefs/apprentice_lesson_typedefs')



const lesson_resolver = require('./resolvers/lesson_resolvers')
const client_resolver = require('./resolvers/client_resolvers')
const subscription_resolver = require('./resolvers/subscription_resolvers')
const instructor_resolver = require('./resolvers/instructor_resolvers')
const apprentice_course_resolver = require('./resolvers/apprentice_course_resolvers')
const apprentice_instructor_resolver = require('./resolvers/apprentice_instructor_resolvers')
const apprentice_plan_resolver = require('./resolvers/apprentice_plan_resolvers')
const apprentice_lesson_resolver = require('./resolvers/apprentice_lesson_resolvers')



const pgclient  = require('./pgclient')


const typeDefs = mergeTypeDefs([lesson_typedefs, client_typedefs, subscription_typedefs, instructor_typedefs, common_typedefs, apprentice_course_typedefs, apprentice_instructor_typedefs, apprentice_plan_typedefs, apprentice_lesson_typedefs])


const resolvers = mergeResolvers([lesson_resolver, client_resolver, subscription_resolver, instructor_resolver, apprentice_course_resolver, apprentice_instructor_resolver, apprentice_plan_resolver, apprentice_lesson_resolver])






const DIST_DIR = path.join(__dirname, '../dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');




app.use(express.static(DIST_DIR)); 


app.get('/', (req, res) => {
    res.sendFile(HTML_FILE);
});




pgclient.connect(err => {
    if (err) {
        console.log("pgclient connect err")
        console.log(err)
        process.exit()
    }

    else {
        console.log("pgclient connect success")
        
    }
})




const server = new ApolloServer({ typeDefs, resolvers });

console.log(`GRAPHQL_SUBPATH: ${GRAPHQL_SUBPATH}`)
server.applyMiddleware({app, path: GRAPHQL_SUBPATH})


app.listen(MAIN_SERVE_PORT, function () {
    console.log('App listening on port: ' + MAIN_SERVE_PORT);
});