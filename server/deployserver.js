const express = require('express');
const path = require('path');
const {MAIN_SERVE_PORT, GRAPHQL_SUBPATH}= require('../config')
const app = express();

// const { ApolloServer } = require('apollo-server-express');
// const pgclient  = require('./pgclient')
// const {typeDefs, resolvers} = require('./merged_gql')
const graphql_server = require('./apolloserver')




const DIST_DIR = path.join(__dirname, '../dist');

const HTML_FILE = path.join(DIST_DIR, 'index.html');

const CHECKIN_APP_DIR = path.join(__dirname, '../checkin_app_dist')
const CHECKIN_APP_HTML_FILE = path.join(CHECKIN_APP_DIR, 'index.html')


const SCHEDULE_APP_DIR = path.join(__dirname, '../scheduleview_dist')
const SCHEDULE_APP_HTML_FILE = path.join(SCHEDULE_APP_DIR, 'index.html')



app.use('/checkin', express.static(CHECKIN_APP_DIR))
app.get('/checkin', (req, res)=>{
    res.sendFile(CHECKIN_APP_HTML_FILE)
})


app.use('/openschedule',express.static(SCHEDULE_APP_DIR))
app.get('/openschedule', (req,res)=>{
    res.sendFile(SCHEDULE_APP_HTML_FILE)
})


app.use(express.static(DIST_DIR)); 
app.get('/', (req, res) => {
    res.sendFile(HTML_FILE);
});


// const server = new ApolloServer({ typeDefs, resolvers });

console.log(`GRAPHQL_SUBPATH: ${GRAPHQL_SUBPATH}`)
graphql_server.applyMiddleware({app, path: GRAPHQL_SUBPATH})


app.listen(MAIN_SERVE_PORT, function () {
    console.log('App listening on port: ' + MAIN_SERVE_PORT);
});