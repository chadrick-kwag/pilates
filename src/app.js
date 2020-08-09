import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Form, Table } from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css';

import { ApolloProvider, } from '@apollo/react-hooks';
import { ApolloClient, InMemoryCache, createHttpLink, useMutation } from '@apollo/client'

import CreateInstructorPage from './CreateInstructorPage'
import ListInstructorPage from './ListInstructorPage'
import ListClientPage from './ListClientPage'
// import CreateClientPage from './CreateClientPage'
import CreateSubscriptionPage from './CreateSubscriptionPage'
import SchedulePage from './SchedulePage/SchedulePage'

import ClientManagePage from './ClientManagePage'
import TopNavBar from './TopNavBar'


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
        else if(this.state.viewmode == "client_manage"){
            mainview = <ClientManagePage apolloclient={client}/>
        }
        else{
            mainview = <div>not yet implemented</div>
        }

        return <div>

            <TopNavBar 
            onClientManageClick={()=>this.setState({viewmode: "client_manage"})}
            onInstructorManageClick={()=>this.setState({viewmode: "instructor_manage"})}
            onPlanManageClick = {()=>this.setState({viewmode: "plan_manage"})}
            onScheduleManageClick = {()=>this.setState({viewmode: "schedule"})}
            />
            

            {mainview}

        </div>
    }
}

ReactDOM.render(<ApolloProvider client={client}>
    <App />
</ApolloProvider>, document.getElementById('app'))