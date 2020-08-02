import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Form, Table } from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css';

import { ApolloProvider, } from '@apollo/react-hooks';
import { useQuery, gql, ApolloClient, InMemoryCache, createHttpLink, useMutation } from '@apollo/client'

import CreateInstructorPage from './CreateInstructorPage'
import ListInstructorPage from './ListInstructorPage'
import ListClientPage from './ListClientPage'
import CreateClientPage from './CreateClientPage'
import CreateSubscriptionPage from './CreateSubscriptionPage'
import SchedulePage from './SchedulePage/SchedulePage'


const cache = new InMemoryCache();
const link = createHttpLink({
    uri: 'http://localhost:4000/'
});

const client = new ApolloClient({
    cache,
    link
});


class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewmode: "list_client"
        }
    }

    render() {

        let mainview

        if (this.state.viewmode == "list_client") {
            mainview = <ListClientPage apolloclient={client}/>
        }
        else if (this.state.viewmode == "create_client") {
            mainview = <CreateClientPage apolloclient={client} changeViewMode={v => this.setState({
                viewmode: v
            })} />
        }
        else if(this.state.viewmode == 'create_instructor'){
            mainview = <CreateInstructorPage apolloclient={client} success_callback={()=>{
                console.log("inside success callback")
                this.setState({viewmode: "list_instructor"})}}/>
        }
        else if(this.state.viewmode == 'list_instructor'){
            mainview = <ListInstructorPage apolloclient={client} />
        }
        else if(this.state.viewmode == 'create_subscription'){
            mainview = <CreateSubscriptionPage apolloclient={client} success_callback={()=>this.setState({
                viewmode: "list_client"
            })}/>
        }
        else if(this.state.viewmode == "schedule"){
            mainview = <SchedulePage apolloclient={client} />
        }

        return <div>

            <div style={{ display: "flex", flexDirection: "row" }}>
                <Button onClick={e => this.setState({ viewmode: "list_client" })}>view clients</Button>
                <Button onClick={e => this.setState({ viewmode: "list_instructor" })}>view instructors</Button>
                <Button onClick={e => this.setState({ viewmode: "create_client" })} >create client</Button>
                <Button onClick={e => this.setState({ viewmode: "create_instructor" })} >create instructor</Button>
                <Button onClick={e => this.setState({ viewmode: "create_subscription" })} >create subscription</Button>
                <Button onClick={e => this.setState({ viewmode: "schedule" })} >schedule</Button>
            </div>

            {mainview}

        </div>
    }
}

ReactDOM.render(<ApolloProvider client={client}>
    <App />
</ApolloProvider>, document.getElementById('app'))