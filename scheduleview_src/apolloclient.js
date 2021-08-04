import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

import { GRAPHQL_SUBPATH } from '../config'

const cache = new InMemoryCache({
    dataIdFromObject: o => {
        console.log(o)
        let retid = o.id ? `${o.__typename}-${o.id}` : `${o.__typename}-${o.cursor}`
        console.log(retid)
        return o
    }
});

const addr = `http://${location.hostname}:${location.port}${GRAPHQL_SUBPATH}`

const httplink = createHttpLink({
    uri: addr
});

const client = new ApolloClient({
    cache: cache,
    link: httplink
});


export default client