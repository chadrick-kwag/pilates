const { GRAPHQL_PORT_INTERNAL, GRAPHQL_SUBPATH } = require('../config.js')
const pgclient = require('./pgclient')
const graphql_server = require('./apolloserver')
const express = require('express');
const app = express();

pgclient.connect(err => {
    if (err) {
        console.log(err)
        console.log("pgclient connect err")
    }

    else {
        console.log("pgclient connect success")
    }
})

graphql_server.applyMiddleware({app, path: GRAPHQL_SUBPATH})
app.listen(GRAPHQL_PORT_INTERNAL, function () {
    console.log('### Test backend server listening on port: ' + GRAPHQL_PORT_INTERNAL);
});
