
const { ApolloServer, gql } = require('apollo-server');
const { Pool, Client } = require('pg')

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Client {
    id: String
    name: String
    phonenumber: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    clients: [Client]
  }

  type Mutation{
      createclient(name: String!, phonenumber: String!): Client
  }
`


const pgclient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'rootpw',
    port: 5432,
})
pgclient.connect(err=>{
    if(err){
        console.log("pgclient connect err")
    }

    else{
        console.log("pgclient connect success")
    }
})


const resolvers = {
    Query: {
        clients: async () => {
            let results = await pgclient.query("select * from pilates.client").then(res => { 
                return res.rows}).catch(e =>{
                    return []
                })

            return results
        },
    },
    Mutation: {
        createclient: async (parent, args)=>{
            console.log(args)

            let ret = await pgclient.query("insert into pilates.client (name, phonenumber) values ($1, $2) returning id,name,phonenumber", [args.name, args.phonenumber]).then(res=>{
                console.log(res)
                return res.rows[0]
            }).catch(err=>{
                return {}
            })

            // let user = await pgclient.query("select * from pilates.client where")
            console.log("ret:")
            console.log(ret)

            return ret
            // if(!ret){
            //     return {}
            // }
            // if(ret.rows){
            //     console.log('returning ret.rows')
            //     console.log(ret.rows[0])
            //     return ret.rows[0]
            // }
            // else{
            //     return {}
            // }
            
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});