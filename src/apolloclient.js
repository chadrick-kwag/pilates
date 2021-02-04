import { ApolloClient, InMemoryCache, createHttpLink, useMutation } from '@apollo/client'
import {gql_server_addr} from '../config'

const cache = new InMemoryCache({
    dataIdFromObject: o=>{
        console.log(o)
        let retid = o.id ? `${o.__typename}-${o.id}` : `${o.__typename}-${o.cursor}`
        console.log(retid)
        return o
    }
});

const link = createHttpLink({
    uri: gql_server_addr
});


const client = new ApolloClient({
    cache,
    link
});


export default client