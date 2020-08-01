import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Form } from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css';

// import { ApolloClient, useQuery, gql } from 'apollo-client'
// import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
// import { HttpLink } from 'apollo-link-http'
import { ApolloProvider } from '@apollo/react-hooks';
// import gql from 'graphql-tag';
import {useQuery, gql, ApolloClient, InMemoryCache, createHttpLink} from '@apollo/client' 




const cache = new InMemoryCache();
const link = createHttpLink({
    uri: 'http://localhost:4000/'
});

const client = new ApolloClient({
    cache,
    link
});

const QUERY = gql`{
    clients{
        id
        name
        phonenumber
    }
}`

console.log(QUERY)

class CreateClientPage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            name: "",
            phonenumber: ""
        }

        this.submitcallback = this.submitcallback.bind(this)
    }


    submitcallback() {
        // send query to graphql
        let {data, loading, error} = useQuery(QUERY)

        console.log(data)
        console.log(loading)
        console.log(error)
    }


    render() {
        return <div>
            <div>
                <span>name</span> <Form.Control value={this.state.name} onChange={e => this.setState({ name: e.target.value })}></Form.Control>

            </div>
            <div>
                <span>phone</span> <Form.Control value={this.state.phonenumber} onChange={e => this.setState({ phonenumber: e.target.value })}></Form.Control>
            </div>
            <div>
                <Button onClick={e => this.submitcallback()}>submit</Button>
            </div>
        </div>
    }
}


class App extends React.Component {

    render() {
        return <div>

            <CreateClientPage />
        </div>
    }
}

ReactDOM.render(<ApolloProvider client={client}>
    <App />
</ApolloProvider>, document.getElementById('app'))