import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider, } from '@apollo/react-hooks';
import client from './apolloclient'
import PhonenumberInput from './components/PhonenumberInput'
import SelectCheckIn from './components/SelectCheckIn'
import { nullFormat } from 'numeral';

class App extends React.Component {

    
    constructor(props) {
        super(props)
        this.state = {
            phase: "phonenumber",
            phonenumber: "",
            selected_client_info: null
        }

        this.reset = this.reset.bind(this)
        
    }


    reset(){
        this.setState({
            phase: "phonenumber",
            phonenumber: "",
            selected_client_info: null,
            candidate_clients: []
        })
    }

    render() {

        if(this.state.phase === 'phonenumber'){
            return <PhonenumberInput onSubmit={(fetched_clients)=>{
                if(fetched_clients.length==1){
                    this.setState({
                        selected_client_info: fetched_clients[0],
                        phase: "select-lesson"
                    })
                }
                else{
                    this.setState({
                        candidate_clients: fetched_clients,
                        phase: 'select-client'
                    })
                }   
            }}/>
        }
        else if(this.state.phase === 'select-client'){
            return <div>hello</div>
        }
        else if(this.state.phase === 'select-lesson'){
            return <SelectCheckIn clientid={this.state.selected_client_info.id} onSuccess={()=>this.reset()}/>
        }

        return
    }
}



ReactDOM.render(<ApolloProvider client={client}>
    <App />
</ApolloProvider>, document.getElementById('app'))