import React from 'react'
import { Form, Button, Table } from 'react-bootstrap'
import { gql } from '@apollo/client'


const CREATE_SUBSCRIPTION_GQL = gql`mutation createsubscription($clientid:Int!, $rounds:Int!, $totalcost: Int!){
    createsubscription(clientid:$clientid, rounds:$rounds, totalcost: $totalcost){
        success
    }
}`


const SEARCH_CLIENT_WITH_NAME = gql`query search_clients($name: String!){
    search_client_with_name(name: $name){
        id
        name
        phonenumber
    }
}`



class CreateSubscriptionPage extends React.Component {


    constructor(props) {

        super(props)

        this.state = {
            client_id: null,
            client_name: "",
            client_search_result: null,
            selected_client: null,
            rounds: "",
            total_cost: ""
        }


        this.search_clients = this.search_clients.bind(this)
        this.check_inputs = this.check_inputs.bind(this)
        this.submitSubscription = this.submitSubscription.bind(this)
    }


    search_clients() {

        if (this.state.client_name == "") {
            console.log("client name is empty")
            return
        }

        this.props.apolloclient.query({
            query: SEARCH_CLIENT_WITH_NAME,
            variables: {
                name: this.state.client_name
            },
            fetchPolicy: 'no-cache'
        }).then(d => {
            let fetched_data = d.data.search_client_with_name

            this.setState({
                client_search_result: fetched_data
            })

        }).catch(e => {
            console.log(JSON.stringify(e))

        })
    }


    check_inputs() {

        if(this.state.selected_client ==null){
            console.log('no selected client')
            return false
        }

        if (this.state.selected_client.id == null) {
            console.log("no selected client id")
            return false
        }

        if (parseInt(this.state.rounds) <= 0) {
            console.log("invalid rounds")
            return false
        }

        if (parseInt(this.state.total_cost) < 0) {
            console.log('invalid total cost')
            return false
        }

        return true
    }

    submitSubscription() {
        // check inputs
        let ret = this.check_inputs()

        if(!ret){
            console.log('failed to validate input')
            return
        }

        this.props.apolloclient.mutate({
            mutation: CREATE_SUBSCRIPTION_GQL,
            variables: {
                clientid: parseInt(this.state.selected_client.id),
                rounds: parseInt(this.state.rounds),
                totalcost: parseInt(this.state.total_cost)
            }
        }).then(d=>{
            console.log(d)

            if(d.data.createsubscription.success){
                console.log("success creating subscription")
                this.props.success_callback()
                return
            }

            console.log("failed to create subscription")
        })
        .catch(e=>{
            console.log('error creating subscription')
            console.log(JSON.stringify(e))
        })

    }


    render() {

        let cost_per_round = parseInt(this.state.total_cost) / parseInt(this.state.rounds)
        console.log("cost_per_round: " + cost_per_round)


        let client_search_result_area

        if (this.state.client_search_result == null) {
            client_search_result_area = null
        }
        else if (this.state.client_search_result.length == 0) {
            client_search_result_area = <div>no results found</div>
        }
        else {
            client_search_result_area = <Table>
                <thead>
                    <th>id</th>
                    <th>name</th>
                    <th>phone</th>
                </thead>
                <tbody>
                    {this.state.client_search_result.map(d => <tr onClick={e => {
                        this.setState({
                            selected_client: d
                        })
                    }}>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                    </tr>)}
                </tbody>
            </Table>
        }

        return <div>
            <h1>회원 플랜 등록</h1>
            <div>
                <h2>회원검색</h2>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <span>회원이름</span>
                    <Form.Control value={this.state.client_name} onChange={e => this.setState({
                        client_name: e.target.value
                    })} style={{ width: "200px" }} />
                    <Button onClick={e => this.search_clients()}>search</Button>
                </div>
                <div>
                    {client_search_result_area}
                </div>
            </div>

            <div>
                <h2>선택회원</h2>
                {this.state.selected_client == null ? <div style={{ height: "100px" }}>없음</div> : <div>
                    <Table>
                        <tr>
                            <td>id</td>
                            <td>{this.state.selected_client.id}</td>
                        </tr>
                        <tr>
                            <td>이름</td>
                            <td>{this.state.selected_client.name}</td>
                        </tr>
                        <tr>
                            <td>연락처</td>
                            <td>{this.state.selected_client.phonenumber}</td>
                        </tr>
                    </Table>
                </div>}

            </div>



            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div>횟수</div>
                <Form.Control value={this.state.rounds} onChange={e => this.setState({
                    rounds: e.target.value
                })} style={{ width: "200px" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <span>총액</span>
                <Form.Control value={this.state.total_cost} onChange={e => this.setState({
                    total_cost: e.target.value
                })} style={{ width: "200px" }} />
            </div>

            {!isNaN(cost_per_round) ? <div>
                <span>회당 단가</span>
                <span>{cost_per_round}</span>
            </div> : null}


            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                <Button onClick={e=>this.submitSubscription()}>create</Button>
            </div>

        </div>
    }
}


export default CreateSubscriptionPage