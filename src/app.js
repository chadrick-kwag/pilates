import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Form, Table } from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css';

// import { ApolloClient, useQuery, gql } from 'apollo-client'
// import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
// import { HttpLink } from 'apollo-link-http'
import { ApolloProvider, } from '@apollo/react-hooks';
// import gql from 'graphql-tag';
import { useQuery, gql, ApolloClient, InMemoryCache, createHttpLink, useMutation } from '@apollo/client'




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


const CREATE_CLIENT_GQL = gql`mutation  CreateClient($name: String!, $phonenumber: String!){
    createclient(name: $name, phonenumber: $phonenumber){
        id
        name
        phonenumber
    }
}`


const DELETE_GQL = gql`mutation DeleteClient($id:Int!){
    deleteclient(id: $id){
        success
    }
}`



console.log(CREATE_CLIENT_GQL)

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

        client.mutate({
            mutation: CREATE_CLIENT_GQL,
            variables: {
                name: this.state.name,
                phonenumber: this.state.phonenumber
            }
        }).then(d => {
            console.log(d)
            this.props.changeViewMode('list')
        })
            .catch(e => {
                console.log(e)
                alert('failed to reigster client')
            })
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


function Listup() {
    // const [init_loading_done, set_init_loading_done] = useState(false)

    const { loading, error, data, refetch } = useQuery(QUERY, {
        fetchPolicy: "network-only"
    });


    if (loading) {
        return <div>loading</div>
    }



    if (data) {
        return <Table>
            <thead>
                <tr>
                    <td>id</td>
                    <td>name</td>
                    <td>phone</td>
                    <td>action</td>
                </tr>

            </thead>
            <tbody>
                {data.clients.map(d => <tr>
                    <td>{d.id}</td>
                    <td>{d.name}</td>
                    <td>{d.phonenumber}</td>
                    <td><Button onClick={e => {
                        console.log('try deleting ' + d.id)
                        client.mutate({
                            mutation: DELETE_GQL,
                            variables: {
                                id: parseInt(d.id)
                            },
                            errorPolicy: "all"
                        }).then(d => {
                            console.log(d)
                            if (d.data.deleteclient.success) {
                                refetch()
                            }
                            else {
                                console.log('failed to delete')
                            }
                        }).catch(e => {
                            console.log(e)
                            console.log(e.data)
                            console.log(JSON.stringify(e, null, 2));
                        })
                    }}>delete</Button></td>

                </tr>)}
            </tbody>

        </Table>
    }

    return <div>nothing</div>
}





class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewmode: "list"
        }
    }

    render() {

        let mainview

        if (this.state.viewmode == "list") {
            mainview = <Listup />
        }
        else if (this.state.viewmode == "create_client") {
            mainview = <CreateClientPage changeViewMode={v => this.setState({
                viewmode: v
            })} />
        }

        return <div>

            <div style={{ display: "flex", flexDirection: "row" }}>
                <Button onClick={e => this.setState({ viewmode: "list" })}>listview</Button>
                <Button onClick={e => this.setState({ viewmode: "create_client" })} >create client</Button>
            </div>

            {mainview}

        </div>
    }
}

ReactDOM.render(<ApolloProvider client={client}>
    <App />
</ApolloProvider>, document.getElementById('app'))