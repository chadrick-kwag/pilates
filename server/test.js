const { graphql_server_options } = require('../config.js')
const pgclient = require('./pgclient')
const server = require('./apolloserver')


pgclient.connect(err => {
    if (err) {
        console.log(err)
        console.log("pgclient connect err")
    }

    else {
        console.log("pgclient connect success")
    }
})



// The `listen` method launches a web server.
server.listen(graphql_server_options).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});