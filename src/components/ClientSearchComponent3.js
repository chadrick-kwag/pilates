// one line client search card

import React, { createRef } from 'react'
import { Card, Table, Button, Form, Spinner } from 'react-bootstrap'


import { SEARCH_CLIENT_WITH_NAME } from '../common/gql_defs'
import client from '../apolloclient'

import Chip from '@material-ui/core/Chip';
import CancelIcon from '@material-ui/icons/Cancel';
import PhoneIcon from '@material-ui/icons/Phone';



class ClientSearchComponent3 extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            client_name: "",
            client_search_result: null,
            selected_client: null,


            force_search: false,
            fetching: false

        }

        this.seach_clients = this.search_clients.bind(this)
        this.get_absolute_dim = this.get_absolute_dim.bind(this)

        this.card = createRef()
        // this.search_inputbox = createRef()
    }

    get_absolute_dim() {

        let out = 100

        if(this.card.current){
            let rect = this.card.current.getBoundingClient
        }
        return 100
    }

    search_clients() {

        if (this.state.client_name.trim() === "") {
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
            let fetched_data = d.data.search_client_with_name.filter(a => {
                return a.disabled === true ? false : true
            })

            this.setState({
                client_search_result: fetched_data,
                fetching: false
            })

        }).catch(e => {
            console.log(JSON.stringify(e))

        })
    }

    render() {

        let search_mode = false

        if (this.state.force_search || this.state.selected_client == null) {
            search_mode = true
        }
        let search_result_area
        if (search_mode!==true){
            search_result_area = null
        }
        else if (this.state.client_search_result == null) {
            search_result_area = null
        }
        else if (this.state.client_search_result.length == 0) {
            search_result_area = <div>no results found</div>
        }
        else {
            search_result_area = <Table className="row-clickable-table">
                <thead>
                    <th>id</th>
                    <th>name</th>
                    <th>phone</th>
                </thead>
                <tbody>
                    {this.state.client_search_result.map(d => <tr onClick={e => {
                        this.setState({
                            force_search: false,
                            selected_client: d
                        })
                        this.props.clientSelectedCallback?.(d)
                    }}>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                    </tr>)}
                </tbody>
            </Table>
        }


        return <Card className='profilecard' ref={this.card}>
            {search_mode ? <Card.Body>

                <div className='row-gravity-center'>
                    <span>회원이름</span>
                    <Form.Control value={this.state.client_name} onChange={e => this.setState({
                        client_name: e.target.value
                    })} />
                    <Button onClick={e => this.search_clients()}>검색</Button>
                    {this.state.selected_client == null ? null : <CancelIcon onClick={_ => this.setState({
                        force_search: false
                    })} />}


                </div>
                <div style={{
                    marginTop: '10px', position: 'absolute', zIndex: '1400',
                    backgroundColor: 'white',
                    left: this.get_absolute_dim()

                }} className='col-gravity-center'>
                    {this.state.fetching ? <Spinner animation='border' /> : search_result_area}
                    

                </div>
            </Card.Body> : <Card.Body>
                    <div className='row-gravity-between'>
                        <span className='row-gravity-left'><Chip label="회원" /> {this.state.selected_client.name} (<PhoneIcon />{this.state.selected_client.phonenumber})</span>
                        <Button variant='outline-dark' size='sm'
                            onClick={e => this.setState({
                                force_search: true
                            })}>회원찾기</Button>
                    </div>

                </Card.Body> }
        </Card>

    }
}

export default ClientSearchComponent3