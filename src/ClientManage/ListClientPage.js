import React from 'react'
import { Form, Table, Button } from 'react-bootstrap'


import { ABLE_CLIENT_BY_CLIENTID, DISABLE_CLIENT_BY_CLIENTID, QUERY_CLIENTS_BY_NAME } from '../common/gql_defs'

import ClientInfoEditModal from './ClientInfoEditModal'
import moment from 'moment'
import ClientDetailModal from './ClientDetailModal'



class ListClientPage extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            search_name: "",
            data: [],
            edit_target_client: null,
            show_detail_target_client: null,
            list_show_disabled_clients: false
        }


        this.fetchdata_by_clientname = this.fetchdata_by_clientname.bind(this)
        this.disable_client = this.disable_client.bind(this)
        this.able_client = this.able_client.bind(this)
    }


    fetchdata_by_clientname() {

        // check input
        let clientname = this.state.search_name.trim()

        if (clientname === "") {
            console.log('clientname empty')
            return
        }


        this.props.apolloclient.query({
            query: QUERY_CLIENTS_BY_NAME,
            variables: {
                name: this.state.search_name
            },
            fetchPolicy: 'no-cache'

        }).then(res => {
            console.log(res)

            if (res.data.query_clients_by_name.success) {
                this.setState({
                    data: res.data.query_clients_by_name.clients
                })
            }
            else {
                alert('query failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('query error')
        })
    }


    able_client(clientid){
        this.props.apolloclient.mutate({
            mutation: ABLE_CLIENT_BY_CLIENTID,
            variables: {
                clientid: parseInt(clientid)
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.able_client_by_clientid.success) {
                // refetch
                this.fetchdata_by_clientname()
                alert('활성화 성공')

            }
            else {
                alert('활성화 실패')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('활성화 에러')
        })
    }

    disable_client(clientid) {
        this.props.apolloclient.mutate({
            mutation: DISABLE_CLIENT_BY_CLIENTID,
            variables: {
                clientid: parseInt(clientid)
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.disable_client_by_clientid.success) {
                // refetch
                this.fetchdata_by_clientname()
                alert('비활성화 성공')

            }
            else {
                alert('비활성화 실패')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('비활성화 에러')
        })
    }

    render() {

        let detail_modal = null

        if (this.state.show_detail_target_client != null) {
            detail_modal = <ClientDetailModal
                apolloclient={this.props.apolloclient}
                client={this.state.show_detail_target_client} onCancel={() => {
                    this.setState({
                        show_detail_target_client: null
                    })

                }}
                onEditSuccess={() => {
                    this.setState({
                        show_detail_target_client: null

                    }, () => {
                        this.refetch_data()
                    })
                }}
            />
        }

        return <div>


            {detail_modal}

            {this.state.edit_target_client == null ? null : <ClientInfoEditModal apolloclient={this.props.apolloclient}
                onSubmitSuccess={() => {
                    console.log('submit success called')
                    this.setState({
                        edit_target_client: null
                    }, () => {
                        this.refetch_data()
                    })
                }}
                client={this.state.edit_target_client}
                onCancelClick={() => {
                    this.setState({
                        edit_target_client: null
                    })
                }}
            />}

            <div style={{ display: "flex", flexDirection: "row" }}>
                <span>이름검색</span>
                <Form.Control style={{ width: "200px" }} value={this.state.search_name} onChange={e => {
                    this.setState({
                        search_name: e.target.value
                    })
                }}></Form.Control>
                <Button onClick={() => this.fetchdata_by_clientname()}>search</Button>
            </div>
            {this.state.data.length == 0 ? <div>no results</div> : <div>
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
                        {this.state.data.map(d => {
                            if(!this.state.list_show_disabled_clients && d.disabled){
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
                                        {d.disabled ? <Button variant='success' onClick={e=>{
                                            let asked = confirm('활성화하시겠습니까?')
                                            if(asked){
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
                </Table></div>}

        </div>
    }
}

export default ListClientPage