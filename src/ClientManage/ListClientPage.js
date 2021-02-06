import React from 'react'
import { Form, Table, Button } from 'react-bootstrap'


import { QUERY_CLIENTS_BY_NAME, FETCH_CLIENTS_GQL, DELETE_CLIENT_GQL } from '../common/gql_defs'

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
            show_detail_target_client: null
        }

        // this.refetch_data = this.refetch_data.bind(this)
        this.fetchdata_by_clientname = this.fetchdata_by_clientname.bind(this)
    }


    fetchdata_by_clientname(){

        // check input
        let clientname = this.state.search_name.trim()

        if(clientname===""){
            console.log('clientname empty')
            return
        }


        this.props.apolloclient.query({
            query: QUERY_CLIENTS_BY_NAME,
            variables: {
                name: this.state.search_name
            },
            fetchPolicy: 'no-cache'
            
        }).then(res=>{
            console.log(res)

            if(res.data.query_clients_by_name.success){
                this.setState({
                    data: res.data.query_clients_by_name.clients
                })
            }
            else{
                alert('query failed')
            }
        }).catch(e=>{
            console.log(JSON.stringify(e))
            alert('query error')
        })
    }

    // refetch_data() {
    //     this.props.apolloclient.query({
    //         query: FETCH_CLIENTS_GQL,
    //         fetchPolicy: "no-cache"
    //     }).then(d => {
    //         console.log(d)
    //         if (d.data.fetch_clients.success) {
    //             this.setState({
    //                 data: d.data.fetch_clients.clients
    //             })
    //             return
    //         }

    //         console.log('failed to fetch client data')


    //     })
    //         .catch(e => {
    //             console.log(e)
    //         })
    // }

    // componentDidMount() {
    //     this.refetch_data()
    // }


    render() {

        // let show_data = []

        // if (this.state.search_name == "") {
        //     show_data = this.state.data
        // }
        // else {
        //     show_data = this.state.data.filter(d => d.name == this.state.search_name)
        // }


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
                <Button onClick={()=>this.fetchdata_by_clientname()}>search</Button>
            </div>
            {this.state.data.length == 0 ? <div>no results</div> : <Table className='row-clickable-table'>
                <thead>
                    <th>id</th>
                    <th>name</th>
                    <th>phone</th>
                    <th>created time</th>
                    <th>action</th>
                </thead>
                <tbody>
                    {this.state.data.map(d => <tr onClick={e => this.setState({
                        show_detail_target_client: d
                    })}>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                        <td>{moment(new Date(parseInt(d.created))).format('YYYY-MM-DD HH:mm')}</td>
                        <td>
                            <div>
                                <Button onClick={e => {
                                    console.log('try deleting ' + d.id)
                                    this.props.apolloclient.mutate({
                                        mutation: DELETE_CLIENT_GQL,
                                        variables: {
                                            id: parseInt(d.id)
                                        },
                                        errorPolicy: "all"
                                    }).then(d => {
                                        console.log(d)
                                        if (d.data.deleteclient.success) {
                                            this.refetch_data()

                                        }
                                        else {
                                            console.log('failed to delete')
                                        }
                                    }).catch(e => {
                                        console.log(e)
                                        console.log(e.data)
                                        console.log(JSON.stringify(e, null, 2));
                                    }

                                    )


                                    e.stopPropagation()

                                }}>delete</Button>
                            </div>
                        </td>
                    </tr>)}
                </tbody>
            </Table>}

        </div>
    }
}

export default ListClientPage