
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

  type Instructor {
      id: String
      name: String
      phonenumber: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    clients: [Client]
    instructors: [Instructor]
  }

  type SuccessResult {
      success: Boolean
  }

  type Mutation{
      createclient(name: String!, phonenumber: String!): Client
      deleteclient(id: Int!): SuccessResult
      createinstructor(name: String!, phonenumber: String!): SuccessResult
      deleteinstructor(id: Int!): SuccessResult
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
        instructors: async () => {
            let results = await pgclient.query("select * from pilates.instructor").then(res=>{
                return res.rows
            }).catch(e=>[])

            return results
        }
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
            
            
        },
        deleteclient: async (parent, args) =>{
            console.log('delete client inside')
            let ret = await pgclient.query('delete from pilates.client where id=$1', [args.id]).then(res=>{
                // console.log(res)
                if(res.rowCount>0) return true

                return false
            })
            .catch(e=>false)

            return {success: ret}
        },
        createinstructor: async (parent, args)=>{
            console.log('inside create instructor')
            let ret = await pgclient.query('insert into pilates.instructor (name, phonenumber) values ($1, $2)',[args.name, args.phonenumber]).then(res=>{
                if(res.rowCount>0) return true

                return false
            }).catch(e=>false)

            return {success: ret}

        },
        deleteinstructor: async (parent, args)=>{
            let ret = await pgclient.query('delete from pilates.instructor where id=$1',[args.id]).then(res=>{
                if(res.rowCount>0){
                    return true
                }

                return false
            }).catch(e=>false)

            return {success: ret}
        }


    }
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});