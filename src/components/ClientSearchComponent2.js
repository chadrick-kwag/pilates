import React from 'react'
import { Table, Button, Form } from 'react-bootstrap'
import { gql } from '@apollo/client'


const SEARCH_CLIENT_WITH_NAME = gql`query search_clients($name: String!){
    search_client_with_name(name: $name){
        id
        name
        phonenumber
    }
}`

class ClientSearchComponent2 extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            client_name: "",
            client_search_result: null,
            selected_client: null,
            force_search: false
        }

        this.search_clients = this.search_clients.bind(this)
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
            fetchPolicy: 'network-only'
        }).then(d => {
            let fetched_data = d.data.search_client_with_name

            this.setState({
                client_search_result: fetched_data
            })

        }).catch(e => {
            console.log(JSON.stringify(e))

        })
    }

    render() {



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
                        // this.setState({
                        //     selected_client: d
                        // })

                        // update state
                        this.setState({
                            selected_client: d,
                            force_search: false
                        })

                        this.props.clientSelectedCallback(d)
                    }}>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                    </tr>)}
                </tbody>
            </Table>
        }

        let searchmode = false

        if (this.state.selected_client == null || this.state.force_search) {
            searchmode = true
        }
        if (searchmode) {
            return <div>
                {this.state.selected_client==null? null : <div><Button onClick={e=>{
                    this.setState({
                        force_search: false
                    })
                }}>back</Button></div>}
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


        }
        else {
            // show selected client info
            return <div>
                <div>
                    <Button onClick={e=>this.setState({
                        force_search: true
                    })}>회원찾기</Button>
                </div>
                <h2>회원정보</h2>
                <div>
                    <span>id: {this.state.selected_client.id}</span>
                    <span>name: {this.state.selected_client.name}</span>
                    <span>phone: {this.state.selected_client.phonenumber}</span>
                </div>

            </div>
        }

    }
}

export default ClientSearchComponent2