import React from 'react'

import ClientSearchComponent2 from '../components/ClientSearchComponent2'
import {Button, Form} from 'react-bootstrap'

import {CREATE_SUBSCRIPTION_GQL} from '../common/gql_defs'


class CreateSubscriptionView extends React.Component{

    constructor(p){
        super(p)

        this.state={
            selected_client: null,
            rounds: "",
            totalcost: ""
        }

        this.check_input = this.check_input.bind(this)
        this.submit = this.submit.bind(this)
    }

    check_input(){

        if(this.state.selected_client==null){
            return false
        }

        try{
            let int_rounds = parseInt(this.state.rounds)
            if(int_rounds<=0){
                return false
            }
        }
        catch(err){
            return false
        }

        try{
            let int_totalcost = parseInt(this.state.totalcost)
            if(int_totalcost <=0){
                return false
            }
        }
        catch(e){
            return false
        }

        return true
    }

    submit(){
        if(!this.check_input()){
            return alert('invalid input')
        }

        this.props.apolloclient.mutate({
            mutation: CREATE_SUBSCRIPTION_GQL,
            variables: {
                clientid: parseInt(this.state.selected_client.id),
                rounds: parseInt(this.state.rounds),
                totalcost: parseInt(this.state.totalcost)
            }
        }).then(d=>{
            console.log(d)
            if(d.data.create_subscription.success){
                this.props.onSubmitSuccess()
            }
            else{
                alert('failed to create subscription')
            }
        }).catch(e=>{
            console.log(e)

            alert('error creating subscription')
        })
    }

    render(){
        return <div>
            <ClientSearchComponent2 apolloclient={this.props.apolloclient}
            clientSelectedCallback={d=>this.setState({
                selected_client: d
            })}
            />
            <div>
                <span>rounds: </span> <Form.Control value={this.state.rounds} onChange={e=>this.setState({
                    rounds: e.target.value
                })}/>
            </div>
            <div>
                <span>total cost: </span>
                <Form.Control value={this.state.totalcost} onChange={e=>this.setState({
                    totalcost: e.target.value
                })}/>
            </div>

            <div>
                <Button onClick={e=>this.props.onCancelClick()}>cancel</Button>
                <Button onClick={e=>this.submit()}>submit</Button>
            </div>
        </div>
    }
}

export default CreateSubscriptionView