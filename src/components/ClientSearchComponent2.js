import React from 'react'
import { Card, Table, Button, Form, Spinner } from 'react-bootstrap'


import { SEARCH_CLIENT_WITH_NAME } from '../common/gql_defs'
import client from '../apolloclient'




class ClientSearchComponent2 extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            client_name: "",
            client_search_result: null,
            fetching: false,
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
        this.setState({
            fetching: true
        })

        client.query({
            query: SEARCH_CLIENT_WITH_NAME,
            variables: {
                name: this.state.client_name
            },
            fetchPolicy: 'no-cache'
        }).then(d => {
            console.log(d)
            let fetched_data = d.data.search_client_with_name.filter(a => a.disabled !== true)

            this.setState({
                fetching: false,
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
            client_search_result_area = <Table className="row-clickable-table">
                <thead>
                    <th>id</th>
                    <th>name</th>
                    <th>phone</th>
                </thead>
                <tbody>
                    {this.state.client_search_result.map(d => <tr onClick={e => {
                        this.setState({
                            client_name: "",
                            client_search_result: null,
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
            return <Card className='profilecard'>
                <Card.Body>
                    {this.state.selected_client == null ? null : <div className="row-gravity-left profilecard-top-area">
                        <Button size='sm' variant='outline-dark' onClick={e => {
                            this.setState({
                                force_search: false
                            })
                        }}>back</Button></div>}

                    <div className='row-gravity-center' >
                        <span>회원이름</span>
                        <Form.Control value={this.state.client_name} onChange={e => this.setState({
                            client_name: e.target.value
                        })} style={{ width: "200px" }} />
                        <Button onClick={e => this.search_clients()}>search</Button>
                    </div>
                    <div className='col-gravity-center' style={{ marginTop: '10px' }}>
                        {this.state.fetching ? <Spinner animation="border"></Spinner> : client_search_result_area}

                    </div>
                </Card.Body>
            </Card>


        }
        else {
            // show selected client info
            return <Card className='profilecard'>
                <Card.Body>
                    <div className="row-gravity-left profilecard-top-area">
                        <Button variant='outline-dark' size='sm' onClick={e => this.setState({
                            force_search: true
                        })}>회원찾기</Button>
                    </div>

                    <div className='row-gravity-center profilecard-bigname'><span>{this.state.selected_client.name}</span></div>
                    <div className='col-gravity-center'>
                        <span>연락처 {this.state.selected_client.phonenumber}</span>
                    </div>
                </Card.Body>
            </Card>
        }

    }
}

export default ClientSearchComponent2