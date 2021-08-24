import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context';
import { GRAPHQL_SUBPATH } from '../config'

const cache = new InMemoryCache({
    dataIdFromObject: o => {
        console.log(o)
        let retid = o.id ? `${o.__typename}-${o.id}` : `${o.__typename}-${o.cursor}`
        console.log(retid)
        return o
    }
});

const addr = `${APOLLO_CLIENT_HTTP_TYPE}://${location.hostname}:${location.port}${GRAPHQL_SUBPATH}`

const httplink = createHttpLink({
    uri: addr
});


const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem('instructor-auth-token');
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? token : "",
            authdomain: 'instructor-app'
        }
    }
});


const client = new ApolloClient({
    cache: cache,
    link: authLink.concat(httplink)
});


export default client