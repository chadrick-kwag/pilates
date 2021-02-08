/*
this version will fetch all clients and create list
realtime filter input will be used to filter clients by name.
*/

import React from 'react'
import { Form, Table, Button, Spinner } from 'react-bootstrap'


import { FETCH_CLIENTS_GQL, ABLE_CLIENT_BY_CLIENTID, DISABLE_CLIENT_BY_CLIENTID, QUERY_CLIENTS_BY_NAME } from '../common/gql_defs'


import moment from 'moment'
import ClientDetailModal from './ClientDetailModal'
import client from '../apolloclient'



class ListClientPageV2 extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            search_name: "",
            data: null,
            show_detail_target_client: null,
            list_show_disabled_clients: false
        }



        this.disable_client = this.disable_client.bind(this)
        this.able_client = this.able_client.bind(this)
        this.fetch_all_clients = this.fetch_all_clients.bind(this)
    }


    componentDidMount() {
        this.fetch_all_clients()
    }


    fetch_all_clients() {

        client.query({
            query: FETCH_CLIENTS_GQL,
            fetchPolicy: 'no-cache'
        }).then(res => {
            if (res.data.fetch_clients.success) {
                this.setState({
                    data: res.data.fetch_clients.clients
                })
            }
            else {
                alert('client fetch failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('client fetch error')
        })
    }



    able_client(clientid) {
        client.mutate({
            mutation: ABLE_CLIENT_BY_CLIENTID,
            variables: {
                clientid: parseInt(clientid)
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.able_client_by_clientid.success) {
                // refetch
                this.fetch_all_clients()
                alert('활성화 성공')

            }
            else {
                alert('활성화 실패')
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))
            alert('활성화 에러')
        })
    }

    disable_client(clientid) {
        client.mutate({
            mutation: DISABLE_CLIENT_BY_CLIENTID,
            variables: {
                clientid: parseInt(clientid)
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.disable_client_by_clientid.success) {
                // refetch
                this.fetch_all_clients()
                alert('비활성화 성공')

            }
            else {
                alert('비활성화 실패')
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))
            alert('비활성화 에러')
        })
    }

    render() {

        let detail_modal = null

        if (this.state.show_detail_target_client != null) {
            detail_modal = <ClientDetailModal
                clientid={parseInt(this.state.show_detail_target_client.id)}
                onCancel={() => {
                    this.setState({
                        show_detail_target_client: null
                    })

                }}
            />
        }

        // calculate filtered data
        let filter_name = this.state.search_name.trim()
        let filtered_data = []
        if (filter_name !== "") {
            filtered_data = this.state.data.filter(d => {
                if (d.name.trim() === filter_name) {
                    return true
                }
                return false
            })
        }
        else {
            if (this.state.data !== null) {
                filtered_data = this.state.data
            }
        }

        filtered_data = filtered_data.sort((a, b) => { parseInt(a.id) > parseInt(b.id) })


        return <div className='row-gravity-center' style={{ width: '100%' }}>


            {detail_modal}

            {this.state.data === null ? <div><Spinner animation='border' /></div> :
                this.state.data.length === 0 ? <div><h3>no clients</h3></div> :
                    <div style={{ width: '100%' }}>
                        <div className='row-gravity-center' >
                            <span>이름검색</span>
                            <Form.Control style={{ width: "200px" }} value={this.state.search_name} onChange={e => {
                                this.setState({
                                    search_name: e.target.value
                                })
                            }}></Form.Control>

                        </div>
                        <div>
                            <div className='row-gravity-right'>
                                <Form.Check checked={this.state.list_show_disabled_clients} onClick={() => this.setState({
                                    list_show_disabled_clients: !this.state.list_show_disabled_clients
                                })} />
                                <span>비활성 회원 표시</span>
                            </div>
                            <Table className='row-clickable-table'>
                                <thead>
                                    <th>id</th>
                                    <th>name</th>
                                    <th>phone</th>
                                    <th>created time</th>
                                    <th>action</th>
                                </thead>
                                <tbody>
                                    {filtered_data.map(d => {
                                        if (!this.state.list_show_disabled_clients && d.disabled) {
                                            return null
                                        }

                                        return <tr onClick={e => this.setState({
                                            show_detail_target_client: d
                                        })}>
                                            <td>{d.id}</td>
                                            <td>{d.name}</td>
                                            <td>{d.phonenumber}</td>
                                            <td>{moment(new Date(parseInt(d.created))).format('YYYY-MM-DD HH:mm')}</td>
                                            <td>
                                                <div>
                                                    {d.disabled ? <Button variant='success' onClick={e => {
                                                        let asked = confirm('활성화하시겠습니까?')
                                                        if (asked) {
                                                            this.able_client(d.id)
                                                        }
                                                        e.stopPropagation()
                                                    }}>활성화</Button> :
                                                        <Button variant='danger' onClick={e => {
                                                            let asked = confirm('비활성화 하시겠습니까?')
                                                            if (asked) {
                                                                this.disable_client(d.id)
                                                            }
                                                            e.stopPropagation()
                                                        }}>비활성화</Button>
                                                    }

                                                </div>
                                            </td>
                                        </tr>
                                    })}
                                </tbody>
                            </Table></div>

                    </div>
            }

        </div>
    }
}

export default ListClientPageV2